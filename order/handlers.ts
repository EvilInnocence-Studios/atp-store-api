import { Query } from "pg";
import { pipeTo } from "serverless-api-boilerplate";
import { pipe } from "ts-functional";
import { HandlerArgs } from "../../core/express/types";
import { getBody, getBodyParam, getParam, getParams, getQueryParam } from "../../core/express/extractors";
import { ICartTotals, IOrder, IOrderFull } from "../../store-shared/order/types";
import { IProduct } from "../../store-shared/product/types";
import { CheckPermissions } from "../../uac/permission/util";
import { Order } from "./service";

class OrderHandlerClass {
    @CheckPermissions("order.view")
    public getFull (...args:HandlerArgs<Query>):Promise<IOrderFull> {
        return pipeTo(Order.getFull, getParam("orderId"))(args);
    }

    @CheckPermissions("order.view")
    public getFiles(...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Order.files.getByUser, getParam("userId"))(args);
    }

    @CheckPermissions("order.create")
    public create (...args:HandlerArgs<any>):Promise<any> {
        return pipeTo(Order.create, getParam("userId"), getBody)(args);
    }

    @CheckPermissions("order.purchase")
    public start (...args:HandlerArgs<any>):Promise<any> {
        return pipeTo(Order.start, getParam("userId"), getBody)(args);
    }

    @CheckPermissions("order.purchase")
    public finalize (...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Order.finalize, getBodyParam("transactionId"))(args);
    }

    @CheckPermissions("order.purchase")
    public finalizeFree (...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Order.finalizeFree, getParam("userId"), getBodyParam("productIds"))(args);
    }

    @CheckPermissions("order.view")
    public search (...args:HandlerArgs<Query>):Promise<IOrder[]> {
        return pipeTo(Order.search, pipe(getParams, q => ({...q, status: "complete"})))(args);
    }

    @CheckPermissions("order.update")
    public update (...args:HandlerArgs<Partial<any>>):Promise<any> { 
        return pipeTo(Order.update, getParam("userId"), getParam("orderId"), getBody)(args);
    }

    @CheckPermissions("order.view")
    public get (...args:HandlerArgs<Query>):Promise<any> {
        return pipeTo(Order.loadById, getParam("userId"), getParam("orderId"))(args);
    }

    @CheckPermissions("order.delete")
    public remove (...args:HandlerArgs<undefined>):Promise<any> {
        return pipeTo(Order.remove, getParam("userId"), getParam("orderId"))(args);
    }

    @CheckPermissions("order.view")
    public getItems (...args:HandlerArgs<Query>):Promise<IProduct[]> {
        return pipeTo(Order.items.get, getParam("userId"), getParam("orderId"))(args);
    }

    public getCartTotal (...args:HandlerArgs<Query>):Promise<ICartTotals> {
        return pipeTo(Order.cart.getTotals, getQueryParam("productIds"), getQueryParam("couponCode"))(args);
    }
}

export const OrderHandlers = new OrderHandlerClass();