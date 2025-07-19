import { del, get, patch, post, upload } from "../../core/express/wrappers";
import { ProductHandlers } from "./handlers";

export const ProductEndpoints = {
    product: {
        GET: get(ProductHandlers.search),
        POST: post(ProductHandlers.create),
        ":productId": {
            GET: get(ProductHandlers.get),
            PATCH: patch(ProductHandlers.update),
            DELETE: del(ProductHandlers.remove),
            media: {
                GET: get(ProductHandlers.getMedia),
                POST: upload(ProductHandlers.addMedia),
                ":mediaId": {
                    GET: get(ProductHandlers.getOneMedia),
                    PATCH: patch(ProductHandlers.updateMedia),
                    DELETE: del(ProductHandlers.removeMedia),
                }
            },
            tag: {
                GET: get(ProductHandlers.getTags),
                POST: post(ProductHandlers.addTag),
                ":tagId": {
                    DELETE: del(ProductHandlers.removeTag),
                }
            },
            related: {
                GET: get(ProductHandlers.getRelated),
                POST: post(ProductHandlers.addRelated),
                ":relatedId": {
                    DELETE: del(ProductHandlers.removeRelated),
                }
            },
            file: {
                GET: get(ProductHandlers.getFiles),
                uploadUrl: {
                    GET: get(ProductHandlers.getUploadUrl),
                },
                // POST: upload(ProductHandlers.uploadFile),
                POST: post(ProductHandlers.addFile),
                ":fileId": {
                    DELETE: del(ProductHandlers.removeFile),
                    download: {
                        GET: get(ProductHandlers.download),
                    },
                }
            },
            subProduct: {
                GET: get(ProductHandlers.getSubProducts),
                POST: post(ProductHandlers.addSubProduct),
                ":subProductId": {
                    DELETE: del(ProductHandlers.removeSubProduct),
                }
            }
        }
    },
}