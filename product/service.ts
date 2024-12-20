import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { IProduct } from "../../store-shared/product/types";

export const Product = {
    ...basicCrudService<IProduct>("products"),
    tags: basicRelationService<IProduct>("relatedProducts", "productId", "products", "relatedProductId"),
    related: basicRelationService<IProduct>("productTags", "productId", "tags", "tagId"),
}