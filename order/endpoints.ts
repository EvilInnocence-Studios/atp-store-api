import { del, get, patch, post } from "../../core/express/wrappers";
import { OrderHandlers } from "./handlers";
import { Order } from "./service";

export const OrderEndpoints = {
    user: {
        ":userId": {
            file: {
                GET: get(OrderHandlers.getFiles),
            },
            order: {
                GET: get(OrderHandlers.search),
                POST: post(OrderHandlers.create),
                start: {
                    POST: post(OrderHandlers.start),
                },
                finalize: {
                    POST: post(OrderHandlers.finalize),
                },
                ":orderId": {
                    GET: get(OrderHandlers.get),
                    PATCH: patch(OrderHandlers.update),
                    DELETE: del(OrderHandlers.remove),
                    full: {
                        GET: get(OrderHandlers.getFull),
                    },
                    item: {
                        GET: get(OrderHandlers.getItems),
                        // POST: post(OrderHandlers.addItem),
                        // ":itemId": {
                        //     PATCH: patch(OrderHandlers.updateItem),
                        //     DELETE: del(OrderHandlers.removeItem),
                        // }
                    }
                }
            }
        }
    }
}