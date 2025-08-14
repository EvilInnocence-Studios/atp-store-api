import { pipeTo, prop } from "ts-functional";
import { Query } from "../../core-shared/express/types";
import { database } from '../../core/database';
import { getBodyParam, getParam, getUserPermissions } from "../../core/express/extractors";
import { HandlerArgs } from '../../core/express/types';
import { IUser } from "../../uac-shared/user/types";
import { CheckPermissions, hasPermission } from "../../uac/permission/util";
import { Wishlist } from "./service";

const db = database();

class WishlistHandlerClass  {
    @CheckPermissions("wishlist.view")
    public async getWishlists (...args:HandlerArgs<Query>): Promise<any[]> {
        const wishlistItems = await pipeTo(Wishlist.get, getParam("userId"))(args);

        const userPermissions = await getUserPermissions(args);
        return hasPermission(["product.disabled"], userPermissions)
            ? wishlistItems
            : (wishlistItems).filter(prop("enabled"));
    }

    @CheckPermissions("wishlist.create")
    public addToWishlist (...args:HandlerArgs<Partial<IUser>>): Promise<any> {
        return pipeTo(Wishlist.add, getParam("userId"), getBodyParam("productId"))(args);
    }

    @CheckPermissions("wishlist.delete")
    public removeFromWishlist (...args:HandlerArgs<undefined>): Promise<any> {
        return pipeTo(Wishlist.remove, getParam("userId"), getParam("productId"))(args);
    }
}

export const WishlistHandlers = new WishlistHandlerClass();
