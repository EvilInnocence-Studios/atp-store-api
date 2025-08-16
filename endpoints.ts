import { deepMerge } from "ts-functional";
import { IApiConfig } from "../core/endpoints";
import { DiscountEndpoints } from "./discount/endpoints";
import { OrderEndpoints } from "./order/endpoints";
import { ProductEndpoints } from "./product/endpoints";
import { wishlistEndpoints } from "./wishlist/endpoints";

export const apiConfig:IApiConfig = deepMerge(
    ProductEndpoints,
    OrderEndpoints,
    DiscountEndpoints,
    wishlistEndpoints,
);
