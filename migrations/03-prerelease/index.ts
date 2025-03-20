import { database } from "../../../core/database";
import { insertCustomerData } from "../00-init/customers";
import { discountsTable } from "../tables";

const db = database();

export const preRelease = {
    down: async () => {
        console.log("Clearing existing customer data");
        await db("wishlists").del();
        await db("orderLineItems").del();
        await db("orders").del();
        await db("userRoles").del();
        await db("users").del();
        console.log("Existing customer data cleared");    
    },
    up: async () => {},
    initData: async () => insertCustomerData(),
}
