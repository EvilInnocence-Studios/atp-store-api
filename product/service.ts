import { Query } from "../../core-shared/express/types";
import { database } from "../../core/database";
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { mapKeys } from "../../core/express/util";
import { downloadMedia, removeMedia, uploadMedia } from "../../core/s3Uploads";
import { IProduct, IProductFile, IProductFull, IProductMedia } from "../../store-shared/product/types";
import { IPermission } from "../../uac-shared/permissions/types";

const db = database();

export const Product = {
    ...basicCrudService<IProduct>("products"),
    searchFull: async ({offset, perPage, ...query}: Query = {} as Query, userPermissionsPromise:Promise<IPermission[]>):Promise<IProductFull[]> => {
        //If user does not have product.disabled permission, filter out disabled products
        const userPermissions = await userPermissionsPromise;
        const canViewDisabledProducts = userPermissions.find(p => p.name === "product.disabled");

        const stmt = db("products")
            .select("products.*", db.raw("array_agg(tags.name) as tags"), "productMedia.url as thumbnailUrl")
            .leftJoin("productMedia", "products.thumbnailId", "productMedia.id")
            .leftJoin("productTags", "products.id", "productTags.productId")
            .leftJoin("tags", "productTags.tagId", "tags.id")
            .groupBy("products.id", "productMedia.url")
            .where(mapKeys(k => `products.${k}`)(query))
            .offset(offset || 0)
            .limit(perPage || 999999);

        if(!canViewDisabledProducts) {
            stmt.where({enabled: true});
        }

        return stmt
            .then((rows) => rows.map((row) => ({
                ...row,
                tags: row.tags.filter((tag:string | null) => tag !== null),
            }))) as Promise<IProductFull[]>;
    },
    related: basicRelationService<IProduct>("relatedProducts", "productId", "products", "relatedProductId"),
    tags: basicRelationService<IProduct>("productTags", "productId", "tags", "tagId"),
    subProducts: basicRelationService<IProduct>("subProducts", "productId", "products", "subProductId"),
    media: {
        ...basicCrudService<IProductMedia>("productMedia", "url"),
        upload: async (productId: number, file: Express.Multer.File):Promise<IProductMedia> => {
            // Upload file to S3
            uploadMedia(`media/product/${productId}`, file);

            // Create record in database
            // If the productId and url unique key already exists, just return the existing record instead
            const [newMedia] = await db("productMedia")
                .insert({ productId, url: file.filename, caption: file.filename }, "*")
                .onConflict(["productId", "url"]).ignore();
            return newMedia;
        },
        remove: async (productId: number, mediaId: string):Promise<null> => {
            const media:IProductMedia = await Product.media.loadById(mediaId);

            // Remove file from S3
            await removeMedia(`media/product/${productId}`, media.url);

            // Remove record from database
            await db("productMedia").where({ id: mediaId }).delete();

            return null;
        },
    },
    files: {
        get: (productId: number):Promise<IProductMedia[]> => db("productFiles")
            .select("*")
            .where({ productId }),
        add: (productId: number, folder:string, file: Express.Multer.File):Promise<IProductMedia> => {
            console.log(file);
            
            // Upload file to S3
            uploadMedia(`product/${folder}`, file);

            // Create record in database
            return db("productFiles")
                .insert({ productId, fileName: file.originalname, folder }, "*")
                .then((rows) => rows[0]);
        },
        remove: async (productId: number, fileId: number):Promise<null> => {
            // Get the file details
            const file:IProductFile = await db("productFiles").where({ id: fileId }).first();
            
            // Remove file from S3
            removeMedia(`products/${file.folder}`, file.fileName);

            // Remove record from database
            return db("productFiles")
                .where({ id: fileId })
                .delete()
                .then(() => null);
        },
        download: async (productId: number, fileId: number):Promise<string> => {
            // Get the file details
            const file:IProductFile = await db("productFiles").where({ id: fileId }).first();
            
            // Generate a presigned URL
            return downloadMedia(`products/${file.folder}`, file.fileName);
        }
    }
}