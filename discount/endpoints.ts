import { del, get, patch, post } from "../../core/express/wrappers";
import { DiscountHandlers } from "./handlers";

export const DiscountEndpoints = {
    discount: {
        GET: get(DiscountHandlers.search),
        POST: post(DiscountHandlers.create),
        ":discountId": {
            GET: get(DiscountHandlers.get),
            PATCH: patch(DiscountHandlers.update),
            DELETE: del(DiscountHandlers.remove),
        }
    }
}
