import { getCalculator } from "../../store-shared/discount/flatPercentage";
import { ICartTotals, IOrderCreateRequest } from "../../store-shared/order/types";
import { Product } from "../../store/product/service";
import { User } from "../../uac/user/service";
import { Discount } from "../discount/service";

export const calculateTotal = async (userId: string, cart:IOrderCreateRequest):Promise<ICartTotals> => {
    const products = await Product.search({offset: 0, perPage: 999999999999, id: cart.ids});
    const discounts = await Discount.search();
    const permissions = await User.permissions.get(userId);
    const calculators = discounts.map(discount => getCalculator(discount, permissions));

    // Calculate the total price of all products in the cart, including product discounts
    const subtotal = products.reduce((total, product) => {
        const price = product.price;
        return total + Math.floor(calculators.reduce(
            (price, discountCalc) => discountCalc.productSalePrice(product, price),
            price
        ) * 100) / 100;
    }, 0);

    // Calculate the total discount for all products in the cart
    const discount = Math.floor(Math.min(calculators.reduce(
        (curDiscount, discountCalc) => discountCalc.cartDiscount(products, subtotal, curDiscount),
        0
    ), subtotal) * 100) / 100;

    return {
        subtotal,
        discount,
        total: subtotal - discount,
    };
}