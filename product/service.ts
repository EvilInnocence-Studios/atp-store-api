import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { Query } from "../../core-shared/express/types";
import { database } from "../../core/database";
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { error500 } from "../../core/express/util";
import { IProduct, IProductFull, IProductMedia } from "../../store-shared/product/types";

const db = database();

export const Product = {
    ...basicCrudService<IProduct>("products"),
    searchFull: ({offset, perPage, ...query}: Query = {} as Query):Promise<IProductFull[]> => {
        return db("products")
            .select("products.*", db.raw("array_agg(tags.name) as tags"), "productMedia.url as thumbnailUrl")
            .leftJoin("productMedia", "products.thumbnailId", "productMedia.id")
            .leftJoin("productTags", "products.id", "productTags.productId")
            .leftJoin("tags", "productTags.tagId", "tags.id")
            .groupBy("products.id", "productMedia.url")
            .where(query)
            .offset(offset || 0)
            .limit(perPage || 999999)
            .then((rows) => rows.map((row) => ({
                ...row,
                tags: row.tags.filter((tag:string | null) => tag !== null),
            }))) as Promise<IProductFull[]>;
    },
    related: basicRelationService<IProduct>("relatedProducts", "productId", "products", "relatedProductId"),
    tags: basicRelationService<IProduct>("productTags", "productId", "tags", "tagId"),
    media: {
        ...basicCrudService<IProductMedia>("productMedia", "url"),
        upload: async (productId: number, file: any/*Express.Multer.File*/):Promise<IProductMedia> => {
            console.log(file);
            const { name, data } = file;

            // Upload file to S3
            const client = new S3Client({ region: "us-east-1" });
            const bucket = "evilinnocence";
            const key = `media/product/${productId}/${name}`;
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: data,
                ACL: "public-read",
            });
            const response = await client.send(command);

            // Create record in database
            // If the productId and url unique key already exists, just return the existing record instead
            const [newMedia] = await db("productMedia")
                .insert({ productId, url: name, caption: name }, "*").onConflict(["productId", "url"]).ignore();
            return newMedia;
        },
        remove: async (productId: number, mediaId: number):Promise<null> => {
            // Remove file from S3
            const client = new S3Client({ region: "us-east-1"});
            const bucket = "evilinnocence";
            const key = `media/product/${productId}/${mediaId}`;
            const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
            const response = await client.send(command);

            // If the removal of the file failed, skip the db record removal
            if (response.$metadata.httpStatusCode !== 204) {
                throw error500("Failed to remove file from the media store");
            }

            // Remove record from database
            await db("productMedia")
                .where({ id: mediaId })
                .delete();

            return null;
        },
    },
}