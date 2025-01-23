import { Product } from "../../store/product/service";
import { IOrderCreateRequest } from "../product/types";

export declare interface ICartTotals {
    subtotal: number;
    discount: number;
    total: number;
}

export const calculateTotal = async (cart:IOrderCreateRequest):Promise<ICartTotals> => {
    const products = await Product.search({offset: 0, perPage: 999999999999, id: cart.ids});
    
    const subtotal = products.reduce((total, product) => {
        return total + product.price;
    }, 0);

    // TODO: Implement discounts
    const discount = 0.0;

    return {
        subtotal,
        discount,
        total: subtotal - discount,
    };
}