import { switchOn } from "ts-functional";
import { database } from "../../../core/database";
import { IProduct, NewProduct } from "../../../store-shared/product/types";
import { Product } from "./init";
import { NodeHtmlMarkdown } from "node-html-markdown";

const db = database();

export const insertProducts = async (products:Product[]):Promise<IProduct[]> => 
    await db("products").insert((products).map<NewProduct>(p => ({
            id: parseInt(p.entity_id),
            name: p.name,
            sku: p.sku,

            // Some URLs are not unique.  Make sure they are by adding the SKU
            url: ["licorice-for-a3",
                "bike-shorts-for-v4",
                "gradient-shirt-for-v4",
                "lbd5-for-a3"
            ].includes(p.url_key)
                ? `${p.url_key}-${p.sku}`
                : p.url_key,

            // Translate HTML descriptions into Markdown
            description: NodeHtmlMarkdown.translate(p.description),

            descriptionShort: NodeHtmlMarkdown.translate(p.short_description),
            productType: (p.type_id ==="downloadable" ? "digital" : "grouped") as "digital" | "grouped",
            subscriptionOnly: p.backstage_pass_only === "1",
            releaseDate: p.news_from_date,

            // Translate brokerage information from Magento
            brokeredAt: switchOn(`${p.exclusive_at}`, {
                '121': () => "Daz",
                '144': () => "HiveWire",
                '122': () => "Renderosity",
                '123': () => "RuntimeDNA",
                'default': () => null,
            }) || null,
            
            brokerageProductId: p.brokerage_product_id || null,
            price: parseFloat(p.price),
            enabled: p.status === "1",
            metaTitle: p.meta_title,
            metaDescription: p.meta_description,
            metaKeywords: p.meta_keyword,
            thumbnailId: null,
            mainImageId: null,
        })), "*");