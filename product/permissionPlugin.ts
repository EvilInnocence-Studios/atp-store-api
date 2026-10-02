import { getParam } from "../../core/express/extractors";
import { error403 } from "../../core/express/errors";
import { IPermission } from "../../uac-shared/permissions/types";
import { Product } from "./service";
import { PermissionPlugin } from "../../uac/permission/registry";
import { Order } from "../order/service";

export const productPermissionPlugin: PermissionPlugin = async (
    userPermissions: IPermission[], funcArgs: any[], userId, permissions = []
) => {
    // If this is a product specific endpoint and the product is not enabled, make sure that the user can view disabled products, has purchased the product, or is deleting from wishlist
    const productId = getParam<string>("productId")(funcArgs);
    const canViewDisabledProducts = userPermissions.find(p => p.name === "product.disabled");
    const isDeletingFromWishlist = permissions.includes("wishlist.delete");
    if (productId && !canViewDisabledProducts && !isDeletingFromWishlist) {
        const product = await Product.loadById(productId);
        if (!product || !product.enabled) {
            const hasPurchased = await Order.hasPurchased(userId, productId);
            if (!hasPurchased) {
                console.log(`User does not have permission to access disabled product ${productId}`);
                throw error403;
            }
        }
    }
};
