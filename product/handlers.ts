import { basicRelationHandlers } from "../../core/express/service/relationHandlers";
import { pipeTo, prop } from "ts-functional";
import { Query } from "../../core-shared/express/types";
import { database } from '../../core/database';
import { getBody, getBodyParam, getFile, getParam, getParams, getQueryParam, getUserPermissions } from "../../core/express/extractors";
import { HandlerArgs } from '../../core/express/types';
import { getPresignedUploadUrl } from "../../core/s3Uploads";
import { IProduct, IProductFile, IProductFull, IProductMedia } from "../../store-shared/product/types";
import { CheckPermissions, hasPermission } from "../../uac/permission/util";
import { Product } from "./service";
import { ITag } from "@common-shared/tag/types";

const db = database();

const tagHandlers = basicRelationHandlers(Product.tags, "productId", "tagId");
const relatedHandlers = basicRelationHandlers(Product.related, "productId", "relatedId");
const subProductHandlers = basicRelationHandlers(Product.subProducts, "productId", "subProductId");

class ProductHandlerClass {

    @CheckPermissions("product.create")
    public create (...args:HandlerArgs<any>):Promise<any> {
        return Product.create(getBody(args));
    }

    @CheckPermissions("product.view")
    public search (...args:HandlerArgs<Query>):Promise<IProductFull[]> {
        return pipeTo(Product.searchFull, getBody, getUserPermissions)(args);
    }

    @CheckPermissions("product.update")
    public update (...args:HandlerArgs<Partial<any>>):Promise<any> { 
        return pipeTo(Product.update, getParam("productId"), getBody)(args);
    }

    @CheckPermissions("product.view")
    public get (...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Product.loadById, getParam("productId"))(args);
    }

    @CheckPermissions("product.delete")
    public remove (...args:HandlerArgs<undefined>):Promise<null> {
        return pipeTo(Product.remove, getParam("productId"))(args);
    }

    @CheckPermissions("media.view")
    public getMedia (...args:HandlerArgs<Query>):Promise<IProductMedia[]> {
        return pipeTo(Product.media.search, getParams)(args);
    }

    @CheckPermissions("media.view")
    public getOneMedia (...args:HandlerArgs<Query>):Promise<IProductMedia> {
        return pipeTo(Product.media.loadById, getParam("mediaId"))(args);
    }

    @CheckPermissions("media.update")
    public addMedia (...args:HandlerArgs<Partial<any>>):Promise<IProductMedia> {
        return pipeTo(Product.media.upload, getParam("productId"), getFile)(args);
    }

    @CheckPermissions("media.update")
    public updateMedia (...args:HandlerArgs<Partial<any>>):Promise<any> {
        return pipeTo(Product.media.update, getParam("mediaId"), getBody)(args);
    }

    @CheckPermissions("media.delete")
    public removeMedia (...args:HandlerArgs<undefined>):Promise<null> {
        return pipeTo(Product.media.remove, getParam("productId"), getParam("mediaId"))(args);
    }

    @CheckPermissions("media.update")
    public sortMedia (...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Product.media.sort, getParam("productId"), getBody)(args);
    }

    @CheckPermissions("product.view")
    public getTags (...args:HandlerArgs<Query>):Promise<ITag[]> {
        return tagHandlers.get(args);
    }

    @CheckPermissions("product.update")
    public addTag (...args:HandlerArgs<string>):Promise<any> {
        return tagHandlers.add(args);
    }

    @CheckPermissions("product.update")
    public removeTag (...args:HandlerArgs<undefined>):Promise<any> {
        return tagHandlers.remove(args);
    }

    @CheckPermissions("product.view")
    public async getRelated (...args:HandlerArgs<Query>):Promise<IProduct[]> {
        const relatedProducts = await relatedHandlers.get(args);
        
        const userPermissions = await getUserPermissions(args);
        return hasPermission(["product.disabled"], userPermissions)
            ? relatedProducts
            : relatedProducts.filter(prop("enabled"));
    }

    @CheckPermissions("product.update")
    public addRelated (...args:HandlerArgs<Partial<any>>):Promise<any> {
        return relatedHandlers.add(args);
    }

    @CheckPermissions("product.update")
    public removeRelated (...args:HandlerArgs<undefined>):Promise<any> {
        return relatedHandlers.remove(args);
    }

    @CheckPermissions("product.view")
    public getFiles (...args:HandlerArgs<Query>):Promise<any[]> {
        return pipeTo(Product.files.get, getParam("productId"))(args);
    }

    @CheckPermissions("product.update")
    public getUploadUrl (...args:HandlerArgs<Query>):Promise<string> {
        return pipeTo(getPresignedUploadUrl, getQueryParam("path"))(args);
    }

    @CheckPermissions("product.update")
    public uploadFile (...args:HandlerArgs<Partial<any>>):Promise<IProductFile> {
        console.log("Adding file to product");
        return pipeTo(Product.files.upload, getParam<string>("productId"), getBodyParam("folder"), getFile)(args);
    }

    @CheckPermissions("product.update")
    public addFile (...args:HandlerArgs<Partial<IProductFile>>):Promise<IProductFile> {
        console.log("Adding file to product");
        return pipeTo(Product.files.add, getParam("productId"), getBody)(args);
    }

    @CheckPermissions("product.delete")
    public removeFile (...args:HandlerArgs<undefined>):Promise<any> {
        return pipeTo(Product.files.remove, getParam("productId"), getParam("fileId"))(args);
    }

    @CheckPermissions("product.view")
    public download (...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Product.files.download, getParam("productId"), getParam("fileId"))(args);
    }

    @CheckPermissions("product.view")
    public getSubProducts (...args:HandlerArgs<Query>):Promise<any[]> {
        return subProductHandlers.get(args);
    }

    @CheckPermissions("product.update")
    public addSubProduct (...args:HandlerArgs<Partial<any>>):Promise<any> {
        return subProductHandlers.add(args);
    }

    @CheckPermissions("product.delete")
    public removeSubProduct (...args:HandlerArgs<undefined>):Promise<any> {
        return subProductHandlers.remove(args);
    }
}

export const ProductHandlers = new ProductHandlerClass();