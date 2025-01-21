import { pipeTo } from "serverless-api-boilerplate";
import { CheckPermissions } from "../../uac/permission/util";
import { getBody, getParam, getParams } from "../../core/express/util";
import { IOrder, IOrderFull, IOrderItem, IProduct } from "../../store-shared/product/types";
import { HandlerArgs } from "../../core/express/types";
import { Query } from "pg";
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
    public finalize (...args:HandlerArgs<undefined>):Promise<any> {
        return pipeTo(Order.finalize, getParam("orderId"))(args);
    }

    @CheckPermissions("order.view")
    public search (...args:HandlerArgs<Query>):Promise<IOrder[]> {
        console.log(getParams(args));
        return pipeTo(Order.search, getParams)(args);
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
}

export const OrderHandlers = new OrderHandlerClass();