import { pipeTo } from "serverless-api-boilerplate";
import { Query } from "../../core-shared/express/types";
import { database } from '../../core/database';
import { HandlerArgs } from '../../core/express/types';
import { getBody, getBodyParam, getFile, getParam, getParams } from "../../core/express/util";
import { IProductMedia } from "../../store-shared/product/types";
import { CheckPermissions } from "../../uac/permission/util";
import { Product } from "./service";

const db = database();

class ProductHandlerClass {
    @CheckPermissions("product.create")
    public create (...args:HandlerArgs<any>):Promise<any> {
        return Product.create(getBody(args));
    }

    @CheckPermissions("product.view")
    public search (...args:HandlerArgs<Query>):Promise<any[]> {
        return Product.search(getBody(args));
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

    @CheckPermissions("media.update")
    public addMedia (...args:HandlerArgs<Partial<any>>):Promise<IProductMedia> {
        return pipeTo(Product.media.upload, getParam("productId"), getFile)(args);
    }

    @CheckPermissions("media.update")
    public updateMedia (...args:HandlerArgs<Partial<any>>):Promise<any> {
        return pipeTo(Product.media.update, getParam("productId"), getParam("mediaId"), getBody)(args);
    }

    @CheckPermissions("media.delete")
    public removeMedia (...args:HandlerArgs<undefined>):Promise<null> {
        return pipeTo(Product.media.remove, getParam("productId"), getParam("mediaId"))(args);
    }

    @CheckPermissions("product.view")
    public getTags (...args:HandlerArgs<Query>):Promise<any[]> {
        return pipeTo(Product.tags.get, getParam("productId"))(args);
    }

    @CheckPermissions("product.update")
    public addTag (...args:HandlerArgs<Partial<any>>):Promise<any> {
        return pipeTo(Product.tags.add, getParam("productId"), getBodyParam("tagId"))(args);
    }

    @CheckPermissions("product.update")
    public removeTag (...args:HandlerArgs<undefined>):Promise<any> {
        return pipeTo(Product.tags.remove, getParam("productId"), getParam("tagId"))(args);
    }

    @CheckPermissions("product.view")
    public getRelated (...args:HandlerArgs<Query>):Promise<any[]> {
        return pipeTo(Product.related.get, getParam("productId"))(args);
    }

    @CheckPermissions("product.update")
    public addRelated (...args:HandlerArgs<Partial<any>>):Promise<any> {
        return pipeTo(Product.related.add, getParam("productId"), getBodyParam("relatedId"))(args);
    }

    @CheckPermissions("product.update")
    public removeRelated (...args:HandlerArgs<undefined>):Promise<any> {
        return pipeTo(Product.related.remove, getParam("productId"), getParam("relatedProductId"))(args);
    }
}

export const ProductHandlers = new ProductHandlerClass();