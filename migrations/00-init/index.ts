import { database } from "../../../core/database";
import { IMigration } from "../../../core/database.d";
import { discounts } from "../01-discounts";
import { discountsTable, orderLineItemsTable, ordersTable, productFilesTable, productMediaTable, productsTable, productTagsTable, relatedProductsTable, subProductsTable, wishlistsTable } from "../tables";
import { insertCustomerData } from "./customers";
import { insertProductData } from "./product";

const db = database();

const importProducts = true;

export const init:IMigration = {
    down: async () => {
        await db.schema
            .dropTableIfExists("discounts"      )
            .dropTableIfExists("orderLineItems" )
            .dropTableIfExists("orders"         )
            .dropTableIfExists("wishlists"      );
        if(importProducts) {
            await db.schema
                .dropTableIfExists("productTags"    )
                .dropTableIfExists("subProducts"    )
                .dropTableIfExists("relatedProducts")
                .dropTableIfExists("productFiles"   )
                .dropTableIfExists("productMedia"   )
                .dropTableIfExists("products"       );
        }
    },
    up: async () => {
        if(importProducts) {
            await db.schema
                .createTable("products",        productsTable       )
                .createTable("productMedia",    productMediaTable   )
                .createTable("productFiles",    productFilesTable   )
                .createTable("productTags",     productTagsTable    )
                .createTable("relatedProducts", relatedProductsTable)
                .createTable("subProducts",     subProductsTable    )
            }
        await db.schema
            .createTable("wishlists",       wishlistsTable      )
            .createTable("orders",          ordersTable         )
            .createTable("orderLineItems",  orderLineItemsTable )
            .createTable("discounts",       discountsTable      )
    },
    priority: 1,
    initData: async () => {
        if(importProducts) {
            await insertProductData();
        }
        await insertCustomerData();

        // Initialize data from discounts migration
        await discounts.initData();
    },
}

