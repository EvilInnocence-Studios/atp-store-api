import { registerPermissionPlugin } from "../uac/permission/registry";
import { init } from "../store/migrations/00-init";
import { productPermissionPlugin } from "./product/permissionPlugin";

registerPermissionPlugin(productPermissionPlugin);

export { apiConfig } from "./endpoints";

export const migrations = [init];
export const setupMigrations = [init];