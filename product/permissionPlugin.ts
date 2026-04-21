import { getParam } from "../../core/express/extractors";
import { error403 } from "../../core/express/errors";
import { IPermission } from "../../uac-shared/permissions/types";
import { Product } from "./service";
import { PermissionPlugin } from "../../uac/permission/registry";

export const productPermissionPlugin: PermissionPlugin = async (userPermissions: IPermission[], funcArgs: any[]) => {
    const productId = getParam<string>("productId")(funcArgs);
    const canViewDisabledProducts = userPermissions.find(p => p.name === "product.disabled");
    
    if (productId && !canViewDisabledProducts) {
        const product = await Product.loadById(productId);
        if (!product || !product.enabled) {
            console.log(`User does not have permission to access disabled product ${productId}`);
            throw error403;
        }
    }
};
