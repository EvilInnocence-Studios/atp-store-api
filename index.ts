import { registerPermissionPlugin } from "../uac/permission/registry";
import { init } from "../store/migrations/00-init";
import { productPermissionPlugin } from "./product/permissionPlugin";
import { FieldRegistry } from "@core/express/util";

registerPermissionPlugin(productPermissionPlugin);

export { apiConfig } from "./endpoints";

export const migrations = [init];
export const setupMigrations = [init];

FieldRegistry.register(
    "products", {
    create: [
        "name", "sku", "url", "description", "descriptionShort", "productType", "releaseDate", "price", "enabled", "pinned", "metaTitle", "metaDescription", "metaKeywords", "thumbnailId", "mainImageId", "isDiscountable"
    ],
    update: [
        "name", "sku", "url", "description", "descriptionShort", "productType", "releaseDate", "price", "enabled", "pinned", "metaTitle", "metaDescription", "metaKeywords", "thumbnailId", "mainImageId", "isDiscountable"
    ],
});
FieldRegistry.register("productFiles", {
    create: ["productId", "fileName", "folder"],
    update: ["fileName", "folder"],
});
FieldRegistry.register("productMedia", {
    create: ["productId", "url", "caption", "order"],
    update: ["url", "caption", "order"],
});
FieldRegistry.register("subProducts", {
    create: ["productId", "subProductId"],
    update: [],
});
FieldRegistry.register("wishlists", {
    create: ["productId", "userId"],
    update: [],
});
FieldRegistry.register("relatedProducts", {
    create: ["productId", "relatedProductId"],
    update: [],
});
FieldRegistry.register("productTags", {
    create: ["productId", "tagId"],
    update: [],
});
FieldRegistry.register("discounts", {
    create: ["name", "type", "amount", "couponCode", "permissionId"],
    update: ["name", "type", "amount", "couponCode", "permissionId"],
});
FieldRegistry.register(
    "orders",
    {
        create: ["userId", "total", "subtotal", "discount", "couponCode", "status", "transactionId", "createdAt"],
        update: ["total", "subtotal", "discount", "couponCode", "status", "transactionId", "createdAt"],
    }
);
FieldRegistry.register("orderLineItems", {
    create: ["productId", "orderId", "quantity"],
    update: ["quantity"],
});
