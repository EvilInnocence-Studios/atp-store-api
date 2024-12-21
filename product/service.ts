import { basicCrudService, basicRelationService } from "../../core/express/service/common";
import { IProduct } from "../../store-shared/product/types";

export const Product = {
    ...basicCrudService<IProduct>("products"),
    related: basicRelationService<IProduct>("relatedProducts", "productId", "products", "relatedProductId"),
    tags: basicRelationService<IProduct>("productTags", "productId", "tags", "tagId"),
}