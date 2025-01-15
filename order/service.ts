import { database } from "../../core/database"
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { IOrder, IOrderFull, IProduct, IProductFile } from "../../store-shared/product/types";

const db = database();

export const Order = {
    ...basicCrudService<IOrder>("orders", "createdAt"),
    getFull: async (id: number):Promise<IOrderFull> => {
        const order = await Order.loadById(id);
        const items = await Order.items.get(id);
        const files = await Order.files.getByOrder(id);
        return { ...order, items, files };
    },
    items: basicRelationService<IProduct>("orderLineItems", "orderId", "products", "productId"),
    files: {
        getByOrder: (orderId: number):Promise<IProductFile[]> => {
            return db
                .select("productFiles.*")
                .from("productFiles")
                .join("orderLineItems", "productFiles.productId", "orderLineItems.productId")
                .where("orderLineItems.orderId", orderId);
        },
        getByUser: (userId: number):Promise<IProductFile[]> => {
            // Get all files linked from all products of all of the user's orders
            return db
                .select("productFiles.*")
                .from("productFiles")
                .join("orderLineItems", "productFiles.productId", "orderLineItems.productId")
                .join("orders", "orderLineItems.orderId", "orders.id")
                .where("orders.userId", userId);
        }
    }
}