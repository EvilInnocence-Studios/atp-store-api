import { del, get, patch, post } from "../../core/express/wrappers";
import { WishlistHandlers } from "./handlers";

export const wishlistEndpoints = {
    user: {
        ":userId": {
            wishlist: {
                GET: get(WishlistHandlers.getWishlists),
                POST: post(WishlistHandlers.addToWishlist),
                ":productId": {
                    DELETE: del(WishlistHandlers.removeFromWishlist),
                }
            },
        }
    },
}