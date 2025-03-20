import { prop } from "ts-functional";
import { Customer } from "./init";
import { loadJsonFile } from "./util";
import { IUser } from "../../../uac-shared/user/types";
import { database } from "../../../core/database";
import { IOrder } from "../../../store-shared/order/types";
import { IProduct } from "../../../store-shared/product/types";
import { User } from "../../../uac/user/service";
import { userRoles, users } from "../../../uac/migrations/00-init";

const db = database();

export const insertCustomerData = async () => {
    const customers = loadJsonFile("_data/customers.json");
    const insertedProducts:IProduct[] = await db("products").select("*");

    // Insert admin user
    console.log("Inserting core users");
    await db("users").insert(users);
    await db("userRoles").insert(userRoles);
    console.log("Core users inserted");

    // Show any duplicate values for customer emails
    (customers as Customer[]).map(prop<Customer, "email">("email")).reduce((acc, email) => {
        if(acc[email]) {
            console.log(`Duplicate email: ${email}`);
        } else {
            acc[email] = true;
        }
        return acc;
    }, {} as Record<string, boolean>);

    // Insert the customer data
    console.log("Importing customer data");

    // For each customer, insert thier order information
    console.log("Importing customer orders");
    for(const customer of (customers as Customer[])) {
        console.log(`Processing customer ${customer.email}`);
        const insertedCustomers:IUser[] = await db("users").insert({
            email: customer.email,
            userName: customer.email,
            passwordHash: "",
            prefix: customer.prefix || "",
            firstName: customer.firstname,
            lastName: customer.lastname,
            suffix: customer.suffix || "",
            createdAt: customer.created_at,
            mustUpdatePassword: true,
        }, "*");
        const insertedCustomer = insertedCustomers[0];
        console.log("  Customer data inserted");
        if(!!insertedCustomer) {
            await db("userRoles").insert({
                userId: insertedCustomer.id,
                roleId: 3,
            })
        }
        if(!!insertedCustomer && customer.orders.length > 0) {
            for(const order of customer.orders) {
                console.log(`  Processing order ${order.entity_id}`);
                const insertedOrders:IOrder[] = await db("orders").insert({
                    userId: insertedCustomer.id,
                    total: parseFloat(order.grand_total),
                    subtotal: parseFloat(order.subtotal),
                    discount: parseFloat(order.discount_amount),
                    couponCode: order.coupon_code,
                    status: "complete",
                    createdAt: order.created_at,                            
                }, "*");
                const insertedOrder = insertedOrders[0];

                // Determine if line item products do not exist
                console.log(`  ${order.items}`);
                const missingProducts = order.items.filter(sku => !insertedProducts.find(p => p.sku === sku));
                if(missingProducts.length > 0) {
                    console.log(`    Missing products: ${missingProducts}`);
                }

                const itemsToInsert = order.items.filter(sku => !missingProducts.includes(sku));
                if(itemsToInsert.length > 0) {
                    await db("orderLineItems").insert(itemsToInsert.map(sku => ({
                        orderId: insertedOrder.id,
                        productId: insertedProducts.find(p => p.sku === sku)!.id,
                        quantity: 1,
                    })));
                }
            }
            console.log("  Customer order info inserted");
        }
        if(!!insertedCustomer && customer.wishlist.length > 0) {
            await db("wishlists").insert(customer.wishlist.map(w => ({
                userId: insertedCustomer.id,
                productId: w.product_id,
            }))).onConflict().ignore();
            console.log("  Customer wishlist info inserted");
        }
    }
}