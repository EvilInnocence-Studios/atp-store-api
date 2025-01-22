import React from 'react';
import { getAppConfig } from '../../../config';
import { IOrder, IProduct } from '../../store-shared/product/types';
import { IUser, SafeUser } from '../../uac-shared/user/types';

export declare interface IOrderConfirmationProps {
    user: SafeUser;
    order: IOrder;
    products: IProduct[];
}

export const OrderConfirmation = ({user, order, products}:IOrderConfirmationProps) => 
    <div>
        <h1>Order Confirmation</h1>
        <p>Hi {user.userName},</p>
        <p>Your order has been placed and your products should be available to download in <a href={`${getAppConfig().publicHost}/my-account/orders`}>your account</a></p>
        <p>Order ID: {order.id}</p>
        <p>Products:</p>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product) => 
                    <tr>
                        <td>{product.name}</td>
                        <td>${product.price}</td>
                    </tr>
                )}
            </tbody>
            <tfoot>
                <tr>
                    <td>Subtotal:</td>
                    <td>${order.subtotal}</td>
                </tr>
                {order.couponCode && <>
                    <tr>
                        <td>Discount ({order.couponCode}):</td>
                        <td>${order.discount}</td>
                    </tr>
                </>}
                <tr>
                    <td>Total:</td>
                    <td>${order.total}</td>
                </tr>
            </tfoot>
        </table>
        <p>Total: ${order.total}</p>
        <p>Thank you for shopping with us!</p>
        <p><a href={`${getAppConfig().publicHost}/my-account/orders`}>View your orders</a></p>
    </div>;