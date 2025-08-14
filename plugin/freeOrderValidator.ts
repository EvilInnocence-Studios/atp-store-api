import { prop } from "ts-functional";
import { IProduct } from "../../store-shared/product/types";
import { calculateTotal } from "../cart/util";

export declare type FreeOrderValidator = (userId: string, products:IProduct[]) => Promise<[boolean, string]>;

const validators:FreeOrderValidator[] = [];

export const registerFreeOrderValidator = (validator:FreeOrderValidator) => {
    validators.push(validator);
}

export const validateFreeOrder = async (userId: string, products: IProduct[]): Promise<[boolean, string]> => {
    for (const validator of validators) {
        const result = await validator(userId, products);
        if (!result[0]) {
            return result;
        }
    }
    return [true, "Order is valid"];
};

// Register basic validator
registerFreeOrderValidator(async (userId: string, products: IProduct[]) => {
    if (products.length === 0) {
        return [false, "No products in the order"];
    }

    const total = await calculateTotal(userId, {ids: products.map(prop("id")), couponCode: ""});
    if (total.total > 0) {
        return [false, "Order total must be zero for free orders"];
    }
    
    return [true, "Order is valid"];
});