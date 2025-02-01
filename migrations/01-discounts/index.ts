import { database } from "../../../core/database";
import { discountsTable } from "../tables";

const db = database();

export const discounts = {
    down: async () => db.schema.dropTableIfExists("discounts"),
    up: async () => db.schema.createTable("discounts", discountsTable),
    initData: async () => db("discounts").insert([
        {id: 1, name: "New Store Sale", type: 'product', amount: 0.50},
        {id: 2, name: "BSP Discount",   type: 'product', amount: 0.50},
    ]),
}
