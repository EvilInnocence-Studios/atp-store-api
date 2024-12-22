import { database } from "../../core/database";
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { IProduct, IProductMedia } from "../../store-shared/product/types";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
// import { fromEnv } from "@aws-sdk/credential-provider-env";

const db = database();

export const Product = {
    ...basicCrudService<IProduct>("products"),
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
            console.log(response);

            // Create record in database
            const [newMedia] = await db("productMedia")
                .insert({ productId, url: name, caption: name }, "*");

            return newMedia;
        },
        remove: async (productId: number, mediaId: number):Promise<null> => {
            // Remove file from S3
            const client = new S3Client({ region: "us-east-1"});
            const bucket = "evilinnocence";
            const key = `media/product/${productId}/${mediaId}`;
            const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
            const response = await client.send(command);
            console.log(response);

            // Remove record from database
            await db("productMedia")
                .where({ id: mediaId })
                .delete();

            return null;
        },
    },
}