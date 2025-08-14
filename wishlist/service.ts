import { database } from '../../core/database';
import { basicRelationService } from '../../core/express/service/common';
import { IProduct } from "../../store-shared/product/types";

const db = database();

export const Wishlist = {
    ...basicRelationService<IProduct>("wishlists", "userId", "products", "productId"),
};
