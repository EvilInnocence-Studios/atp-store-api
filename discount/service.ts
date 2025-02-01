import { basicCrudService } from "../../core/express/service/common";
import { IDiscount } from "../../store-shared/discount/types";

export const Discount = {
    ...basicCrudService<IDiscount>("discounts"),
}