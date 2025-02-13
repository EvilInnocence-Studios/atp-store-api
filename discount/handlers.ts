import { pipeTo } from "serverless-api-boilerplate";
import { Query } from "../../core-shared/express/types";
import { getBody, getParam } from "../../core/express/extractors";
import { HandlerArgs } from "../../core/express/types";
import { IDiscount } from "../../store-shared/discount/types";
import { CheckPermissions } from "../../uac/permission/util";
import { Discount } from "./service";

class DiscountHandlerClass {
    @CheckPermissions("discount.view")
    public search (...args:HandlerArgs<Query>):Promise<IDiscount[]> {
        return Discount.search();
    }

    @CheckPermissions("discount.create")
    public create (...args:HandlerArgs<IDiscount>):Promise<IDiscount> {
        return pipeTo(Discount.create, getBody)(args);
    }

    @CheckPermissions("discount.view")
    public get (...args:HandlerArgs<Query>):Promise<IDiscount> {
        return pipeTo(Discount.loadById, getParam("discountId"))(args);
    }

    @CheckPermissions("discount.update")
    public update (...args:HandlerArgs<Partial<IDiscount>>):Promise<IDiscount> {
        return pipeTo(Discount.update, getParam("discountId"), getBody)(args);
    }

    @CheckPermissions("discount.delete")
    public remove (...args:HandlerArgs<undefined>):Promise<any> {
        return pipeTo(Discount.remove, getParam("discountId"))(args);
    }
}

export const DiscountHandlers = new DiscountHandlerClass();