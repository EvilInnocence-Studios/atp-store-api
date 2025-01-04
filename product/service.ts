import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { Query } from "../../core-shared/express/types";
import { database } from "../../core/database";
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { error500 } from "../../core/express/util";
import { IProduct, IProductFile, IProductFull, IProductMedia } from "../../store-shared/product/types";

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
    files: {
        get: (productId: number):Promise<IProductMedia[]> => db("productFiles")
            .select("*")
            .where({ productId }),
        add: (productId: number, folder:string, file: any/*Express.Multer.File*/):Promise<IProductMedia> => {
            console.log(file);
            
            // Upload file to S3
            const client = new S3Client({ region: "us-east-1" });
            const bucket = "evilinnocence";
            const key = `/product/${folder}/${file.originalname}`;
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: file.buffer,
            });
            client.send(command);

            // Create record in database
            return db("productFiles")
                .insert({ productId, fileName: file.originalname, folder }, "*")
                .then((rows) => rows[0]);
        },
        remove: async (productId: number, fileId: number):Promise<null> => {
            // Get the file details
            const file:IProductFile = await db("productFiles")
                .where({ id: fileId })
                .first();
            
            // Remove file from S3
            const client = new S3Client({ region: "us-east-1" });
            const bucket = "evilinnocence";
            const key = `/products/${file.folder}/${file.fileName}`;
            const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
            client.send(command);

            // Remove record from database
            return db("productFiles")
                .where({ id: fileId })
                .delete()
                .then(() => null);
        },
        download: async (productId: number, fileId: number):Promise<string> => {
            // Get the file details
            const file:IProductFile = await db("productFiles")
                .where({ id: fileId })
                .first();
            
            // Generate a presigned URL
            const client = new S3Client({ region: "us-east-1" });
            const bucket = "evilinnocence";
            const key = `products/${file.folder}/${file.fileName}`;
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            const url = await getSignedUrl(client, command, {expiresIn: 3600});

            // Forward to the presigned URL
            return url;
        }
    }
}