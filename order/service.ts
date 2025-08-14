import {
    ApiError,
    CheckoutPaymentIntent,
    OrdersController
} from "@paypal/paypal-server-sdk";
import { Setting } from "../../common/setting/service";
import { database } from "../../core/database";
import { error500 } from "../../core/express/errors";
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { getPayPalClient } from "../../core/paypal";
import { render } from "../../core/render";
import { sendEmail } from "../../core/sendEmail";
import { ICartTotals, IOrder, IOrderCreateRequest, IOrderFull } from "../../store-shared/order/types";
import { IProduct, IProductFile } from "../../store-shared/product/types";
import { User } from "../../uac/user/service";
import { calculateTotal } from "../cart/util";
import { OrderConfirmation } from "../components/orderConfirmation";
import { validateFreeOrder } from "../plugin/freeOrderValidator";
import { Product } from "../product/service";

const db = database();

const getOrdersController = async () => new OrdersController(await getPayPalClient());

const createOrder = async (products:IProduct[], total: number) => {
    const collect = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            cart: products.map((product) => ({
                id: product.sku,
                name: product.name,
                quantity: 1,
                unit_amount: {
                    currency_code: "USD",
                    value: product.price.toString(),
                },
            })),
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: "USD",
                        value: total.toString(),
                    },
                },
            ],
        },
        prefer: "return=minimal",
    }; 

    try {
        const controller = await getOrdersController();
        const { body, ...httpResponse } = await controller.ordersCreate(
            collect
        );
        // Get more response info...
        // const { statusCode, headers } = httpResponse;
        return {
            jsonResponse: JSON.parse(body as string),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        console.log(error);
        if (error instanceof ApiError) {
            // const { statusCode, headers } = error;
            throw new Error(error.message);
        }
    }
};

const captureOrder = async (transactionId: string) => {
    const collect = {
        id: transactionId,
        prefer: "return=minimal",
    };

    try {
        const controller = await getOrdersController();
        const { body, ...httpResponse } = await controller.ordersCapture(
            collect
        );
        // Get more response info...
        // const { statusCode, headers } = httpResponse;
        return {
            jsonResponse: JSON.parse(body as string),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            // const { statusCode, headers } = error;
            throw error500(error.message);
        }
    }
};

export const Order = {
    ...basicCrudService<IOrder>("orders", "createdAt"),
    getFull: async (id: string):Promise<IOrderFull> => {
        const order = await Order.loadById(id);
        const items = await Order.items.get(id);
        const files = await Order.files.getByOrder(id);
        return { ...order, items, files };
    },
    createFromProducts: async (productIds: string[], userId: string):Promise<IOrder> => {
        const products = await Product.search({offset: 0, perPage: 999999999999, id: productIds});
        const total = await calculateTotal(userId, {ids: productIds, couponCode: ""});

        const order = await Order.create({
            userId,
            status: "complete",
            ...total,
            couponCode: "",
            transactionId: "",
            createdAt: new Date().toISOString(),
        });

        await Promise.all(products.map(async (product) => {
            await Order.items.add(order.id, product.id);
        }));

        return order;
    },
    items: basicRelationService<IProduct>("orderLineItems", "orderId", "products", "productId"),
    start: async (userId: string, order: IOrderCreateRequest):Promise<IOrder> => {
        const products = await Product.search({offset: 0, perPage: 999999999999, id: order.ids});
        const total = await calculateTotal(userId, order);

        const payPalResult = await createOrder(products, total.total);

        if(payPalResult) {
            const newOrder = await Order.create({
                userId,
                status: "pending",
                ...total,
                transactionId: payPalResult.jsonResponse.id,
                couponCode: order.couponCode,
                createdAt: new Date().toISOString(),
            });

            await Promise.all(products.map(async (product) => {
                await Order.items.add(newOrder.id, product.id);
            }));

            return newOrder;
        } else {
            throw error500("Failed to create order");
        }
    },
    finalize: async (transactionId: string):Promise<IOrder> => {
        // Get the order.  Do nothing if it's already complete
        const order = await Order.loadBy("transactionId")(transactionId);
        if(order.status === "complete") {
            return order;
        }

        if(order.transactionId && order.transactionId === transactionId) {
            // Finalize the order
            const payPalResult = await captureOrder(order.transactionId);
            const finalOrder = await Order.update(order.id, {status: "complete"});

            // Send order confirmation email
            const user = await User.loadById(order.userId);
            const products = await Order.items.get(order.id);
            const html = render(OrderConfirmation, {user, order, products});
            const supportEmail = await Setting.get("supportEmail");
            const subject = await Setting.get("orderConfirmationSubject");
            await sendEmail(
                subject,
                html,
                [user.email, supportEmail]);

            return finalOrder;
        } else {
            throw error500("Order has no transaction ID");
        }
    },
    finalizeFree: async (userId: string, productIds: string[]):Promise<IOrder> => {
        const products = await Product.search({offset: 0, perPage: 999999999999, id: productIds});
        const total = await calculateTotal(userId, {ids: productIds, couponCode: ""});

        const [isValid, message] = await validateFreeOrder(userId, products);
        // Make sure the total is 0
        if(!isValid) {
            throw error500(message);
        }

        const order = await Order.create({
            userId,
            status: "complete",
            ...total,
            couponCode: "",
            transactionId: "",
            createdAt: new Date().toISOString(),
        });

        await Promise.all(products.map(async (product) => {
            await Order.items.add(order.id, product.id);
        }));

        // Send order confirmation email
        const user = await User.loadById(userId);
        const html = render(OrderConfirmation, {user, order, products});
        const supportEmail = await Setting.get("supportEmail");
        const subject = await Setting.get("orderConfirmationSubject");
        await sendEmail(
            subject,
            html,
            [user.email, supportEmail]);
        
        return order;
    },
    files: {
        getByOrder: async (orderId: string):Promise<IProductFile[]> => {
            const productFiles = await db
                .select("productFiles.*")
                .from("productFiles")
                .join("orderLineItems", "productFiles.productId", "orderLineItems.productId")
                .join("orders", "orderLineItems.orderId", "orders.id")
                .where("orderLineItems.orderId", orderId)
                .where("orders.status", "complete");

            const subProductFiles = await db
                .select("productFiles.*")
                .from("productFiles")
                .join("subProducts", "productFiles.productId", "subProducts.subProductId")
                .join("orderLineItems", "subProducts.productId", "orderLineItems.productId")
                .join("orders", "orderLineItems.orderId", "orders.id")
                .where("orderLineItems.orderId", orderId)
                .where("orders.status", "complete");

            return [...productFiles, ...subProductFiles];
        },
        getByUser: async (userId: number):Promise<IProductFile[]> => {
            // Get all files linked from all products of all of the user's orders
            const productFiles = await db
                .select("productFiles.*")
                .from("productFiles")
                .join("orderLineItems", "productFiles.productId", "orderLineItems.productId")
                .join("orders", "orderLineItems.orderId", "orders.id")
                .where("orders.userId", userId)
                .where("orders.status", "complete");

            const subProductFiles = await db
                .select("productFiles.*")
                .from("productFiles")
                .join("subProducts", "productFiles.productId", "subProducts.subProductId")
                .join("orderLineItems", "subProducts.productId", "orderLineItems.productId")
                .join("orders", "orderLineItems.orderId", "orders.id")
                .where("orders.userId", userId)
                .where("orders.status", "complete");

            return [...productFiles, ...subProductFiles];
        }
    },
    cart: {
        getTotals: async (userId: string, products: string[], couponCode: string):Promise<ICartTotals> => {
            return await calculateTotal(userId, {ids: products, couponCode});
        }
    },
    report: {
        sales: {
            get: async ():Promise<any> => {
                // Placeholder for sales report logic
                return db.select("*").from("orders").where("status", "complete");
            }
        }
    }
}