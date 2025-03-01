import { database } from "../../../core/database";

/*
orderLineItems: add orderId (orders.id), productId (products.id)
orders: add userId (users.id)
productFiles: add productId (products.id)
productMedia: add productId (products.id)
productTags: add productId (products.id), tagId (tags.id)
product: add thumbnailId (productMedia.id), mainImageId (productMedia.id)
relatedProducts: add productId (products.id), relatedProductId (products.id)
subProducts: add productId (products.id), subProductId (products.id)
tags: add groupId (tagGroups.id)
wishlists: add userId (users.id), productId (products.id)
*/

const db = database();

export const foreignKeys = {
    down: async () => {
        await db.raw('ALTER TABLE "orderLineItems" DROP CONSTRAINT IF EXISTS "orderLineItems_orderId_foreign"');
        await db.raw('ALTER TABLE "orderLineItems" DROP CONSTRAINT IF EXISTS "orderLineItems_productId_foreign"');

        await db.raw('ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_userId_foreign"');

        await db.raw('ALTER TABLE "productFiles" DROP CONSTRAINT IF EXISTS "productFiles_productId_foreign"');

        await db.raw('ALTER TABLE "productMedia" DROP CONSTRAINT IF EXISTS "productMedia_productId_foreign"');

        await db.raw('ALTER TABLE "productTags" DROP CONSTRAINT IF EXISTS "productTags_productId_foreign"');
        await db.raw('ALTER TABLE "productTags" DROP CONSTRAINT IF EXISTS "productTags_tagId_foreign"');

        await db.raw('ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_thumbnailId_foreign"');
        await db.raw('ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_mainImageId_foreign"');

        await db.raw('ALTER TABLE "relatedProducts" DROP CONSTRAINT IF EXISTS "relatedProducts_productId_foreign"');
        await db.raw('ALTER TABLE "relatedProducts" DROP CONSTRAINT IF EXISTS "relatedProducts_relatedProductId_foreign"');

        await db.raw('ALTER TABLE "subProducts" DROP CONSTRAINT IF EXISTS "subProducts_productId_foreign"');
        await db.raw('ALTER TABLE "subProducts" DROP CONSTRAINT IF EXISTS "subProducts_subProductId_foreign"');

        await db.raw('ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_groupId_foreign"');

        await db.raw('ALTER TABLE "wishlists" DROP CONSTRAINT IF EXISTS "wishlists_userId_foreign"');
        await db.raw('ALTER TABLE "wishlists" DROP CONSTRAINT IF EXISTS "wishlists_productId_foreign"');
    },
    up: async () => {
        await db.schema.alterTable('orderLineItems', (table) => {
            table.foreign('orderId').references('orders.id').onDelete('CASCADE');
            table.foreign('productId').references('products.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('orders', (table) => {
            table.foreign('userId').references('users.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('productFiles', (table) => {
            table.foreign('productId').references('products.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('productMedia', (table) => {
            table.foreign('productId').references('products.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('productTags', (table) => {
            table.foreign('productId').references('products.id').onDelete('CASCADE');
            table.foreign('tagId').references('tags.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('products', (table) => {
            table.foreign('thumbnailId').references('productMedia.id').onDelete('SET NULL');
            table.foreign('mainImageId').references('productMedia.id').onDelete('SET NULL');
        });

        await db.schema.alterTable('relatedProducts', (table) => {
            table.foreign('productId').references('products.id').onDelete('CASCADE');
            table.foreign('relatedProductId').references('products.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('subProducts', (table) => {
            table.foreign('productId').references('products.id').onDelete('CASCADE');
            table.foreign('subProductId').references('products.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('tags', (table) => {
            table.foreign('groupId').references('tagGroups.id').onDelete('CASCADE');
        });

        await db.schema.alterTable('wishlists', (table) => {
            table.foreign('userId').references('users.id').onDelete('CASCADE');
            table.foreign('productId').references('products.id').onDelete('CASCADE');
        });
    }
}
