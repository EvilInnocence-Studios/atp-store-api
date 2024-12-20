import { del, get, patch, post } from "../../core/express/wrappers";
import { ProductHandlers } from "./handlers";

export const ProductEndpoints = {
    product: {
        GET: get(ProductHandlers.search),
        POST: post(ProductHandlers.create),
        ":productId": {
            GET: get(ProductHandlers.get),
            PATCH: patch(ProductHandlers.update),
            DELETE: del(ProductHandlers.remove),
            tag: {
                GET: get(ProductHandlers.getTags),
                POST: post(ProductHandlers.addTag),
                DELETE: del(ProductHandlers.removeTag),
            },
            related: {
                GET: get(ProductHandlers.getRelated),
                POST: post(ProductHandlers.addRelated),
                DELETE: del(ProductHandlers.removeRelated),
            }
        }
    },
}