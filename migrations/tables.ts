import { Knex } from "knex";

export const productsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.string("name", 255).notNullable();
    t.string("sku", 64).notNullable().unique();
    t.string("url", 255).notNullable().unique();
    t.text("description").notNullable();
    t.text("descriptionShort").notNullable();
    t.enum("productType", ["digital", "grouped"]).notNullable();
    t.boolean("subscriptionOnly").notNullable();
    t.date("releaseDate");
    t.string("brokeredAt", 255);
    t.string("brokerageProductId", 255);
    t.decimal("price", 10, 2).notNullable();
    t.boolean("enabled").notNullable();
    t.text("metaTitle");
    t.text("metaDescription");
    t.text("metaKeywords");
    t.bigInteger("thumbnailId").unsigned().references("productMedia.id").onDelete("SET NULL");
    t.bigInteger("mainImageId").unsigned().references("productMedia.id").onDelete("SET NULL");
};

export const productMediaTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.string("url", 255).notNullable();
    t.text("caption");
    t.integer("order");
    t.unique(["productId", "url"]);
};

export const productFilesTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.string("fileName", 255).notNullable();
    t.string("folder", 255).notNullable();
};

export const productTagsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.bigInteger("tagId").unsigned().notNullable().references("tags.id").onDelete("CASCADE");
    t.unique(["productId", "tagId"]);
};

export const wishlistsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.bigInteger("userId").unsigned().notNullable().references("users.id").onDelete("CASCADE");
    t.unique(["productId", "userId"]);
};

export const relatedProductsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.bigInteger("relatedProductId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.unique(["productId", "relatedProductId"]);
};

export const subProductsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.bigInteger("subProductId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.unique(["productId", "subProductId"]);
};

export const ordersTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("userId").unsigned().notNullable().references("users.id").onDelete("CASCADE");
    t.decimal("total", 10, 2).notNullable();
    t.decimal("subtotal", 10, 2).notNullable();
    t.decimal("discount", 10, 2).notNullable();
    t.string("couponCode");
    t.string("status").notNullable().defaultTo("pending");
    t.string("transactionId");
    t.dateTime("createdAt").notNullable();
};

export const orderLineItemsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.bigInteger("orderId").unsigned().notNullable().references("orders.id").onDelete("CASCADE");
    t.bigInteger("productId").unsigned().notNullable().references("products.id").onDelete("CASCADE");
    t.integer("quantity").notNullable();
};

export const discountsTable = (t:Knex.CreateTableBuilder) => {
    t.bigIncrements();
    t.string("name").notNullable();
    t.enum("type", ["product", "cart"]).notNullable().defaultTo("product");
    t.decimal("amount").notNullable();
    t.string("couponCode");
    t.bigInteger("permissionId").unsigned();
}
