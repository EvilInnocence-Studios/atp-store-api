import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
} from "@paypal/paypal-server-sdk";
import { getAppConfig } from "../../../config";
import { database } from "../../core/database";
import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { error500 } from "../../core/express/util";
import { render } from "../../core/render";
import { sendEmail } from "../../core/sendEmail";
import { ICartTotals, IOrder, IOrderCreateRequest, IOrderFull } from "../../store-shared/order/types";
import { IProduct, IProductFile } from "../../store-shared/product/types";
import { User } from "../../uac/user/service";
import { calculateTotal } from "../cart/util";
import { OrderConfirmation } from "../components/orderConfirmation";
import { Product } from "../product/service";

const db = database();

const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PORT = 8080,
} = process.env;

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID as string,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET as string,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
}); 

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

// TODO
// - calculate the price of the cart based on items and coupon code
// - add paypal config to env
// - finish integration with paypal

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
        const { body, ...httpResponse } = await ordersController.ordersCreate(
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
        const { body, ...httpResponse } = await ordersController.ordersCapture(
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
    items: basicRelationService<IProduct>("orderLineItems", "orderId", "products", "productId"),
    start: async (userId: string, order: IOrderCreateRequest):Promise<IOrder> => {
        const products = await Product.search({offset: 0, perPage: 999999999999, id: order.ids});
        const total = await calculateTotal(order);

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
                await Order.items.add(newOrder.id, product.id).onConflict().ignore();
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
            await sendEmail(getAppConfig().emailTemplates.orderConfirmation.subject, html, [user.email]);

            return finalOrder;
        } else {
            throw error500("Order has no transaction ID");
        }
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
        getTotals: async (products: string[], couponCode: string):Promise<ICartTotals> => {
            return await calculateTotal({ids: products, couponCode});
        }
    }
}