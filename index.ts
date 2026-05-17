import { registerPermissionPlugin } from "../uac/permission/registry";
import { init } from "../store/migrations/00-init";
import { productPermissionPlugin } from "./product/permissionPlugin";
import { FieldRegistry } from "@core/express/util";

registerPermissionPlugin(productPermissionPlugin);

export { apiConfig } from "./endpoints";

export const migrations = [init];
export const setupMigrations = [init];

FieldRegistry.register(
    "products",
    [
        "name", "url", "sku", "price", "discount", "enabled", "pinned",
        "metaTitle", "metaDescription", "metaKeywords"
    ]
);
FieldRegistry.register("productFiles", ["fileName", "folder"]);
FieldRegistry.register("productMedia", ["url", "caption", "order"]);
FieldRegistry.register("subProducts", []);
FieldRegistry.register("wishlists", []);
FieldRegistry.register("relatedProducts", []);
FieldRegistry.register("productTags", []);
FieldRegistry.register("discounts", ["name", "type", "amount", "couponCode", "permissionId"]);
FieldRegistry.register(
    "orders",
    ["total", "subtotal", "discount", "couponCode", "status", "transactionId", "createdAt"]
);
FieldRegistry.register("orderLineItems", ["quantity"]);
