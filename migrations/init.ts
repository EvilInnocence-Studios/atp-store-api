import { database } from "../../core/database";
import { IMigration } from "../../core/database.d";
import products from "../../../_data/products.json";
import { IProduct, NewProduct } from "../../store-shared/product/types";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { switchOn } from "ts-functional";

const db = database();

type Product = {
    entity_id: string;
    entity_type_id: string;
    attribute_set_id: string;
    type_id: string;
    sku: string;
    created_at: string;
    updated_at: string;
    has_options: string;
    required_options: string;
    status: string;
    visibility: string;
    tax_class_id: string;
    enable_googlecheckout: string;
    backstage_pass_only: string;
    has_related_products: string;
    xd_fix_morphs: string;
    exclusive_at: string | null;
    links_purchased_separately: string;
    links_exist: string;
    name: string;
    url_key: string;
    msrp_enabled: string;
    msrp_display_actual_price_type: string;
    meta_title: string | null;
    meta_description: string | null;
    image: string;
    small_image: string;
    thumbnail: string;
    custom_design: string | null;
    page_layout: string | null;
    options_container: string;
    figure: string | null;
    daz_studio_version: string;
    poser_version: string;
    requires: string;
    full_body_morphs: string | null;
    brokerage_product_id: string | null;
    samples_title: string;
    links_title: string;
    gift_message_available: string | null;
    url_path: string;
    image_label: string | null;
    small_image_label: string | null;
    thumbnail_label: string | null;
    news_from_date: string;
    news_to_date: string;
    special_from_date: string | null;
    special_to_date: string | null;
    custom_design_from: string | null;
    custom_design_to: string | null;
    description: string;
    short_description: string;
    meta_keyword: string | null;
    custom_layout_update: string | null;
    readme: string | null;
    price: string;
    special_price: string | null;
    msrp: string | null;
    is_salable: string;
    stock_item: Record<string, unknown>;
    downloadable_links: {
        link_id: string;
        title: string | null;
        price: string | null;
        file: string | null;
        type: string;
    }[];
    categories: {
        id: string;
        name: string;
        url_key: string;
        path: string;
    }[];
};
export const init:IMigration = {
    down: () => db.schema
        .dropTableIfExists("productTags")
        .dropTableIfExists("relatedProducts")
        .dropTableIfExists("products"),
    up: () => db.schema
        .createTable("products", t => {
            t.increments().unsigned();
            t.string("name", 255).notNullable();
            t.string("sku", 64).notNullable().unique();
            t.string("url", 255).notNullable().unique();
            t.text("description").notNullable();
            t.text("descriptionShort").notNullable();
            t.enum("productType", ["digital", "grouped"]).notNullable();
            t.boolean("subscriptionOnly").notNullable();
            t.date("releaseDate");
            t.string("brokeredAt", 255);
            t.string("brokerageProductId", 255);
            t.decimal("price", 10, 2).notNullable();
            t.boolean("enabled").notNullable();
            t.text("metaTitle");
            t.text("metaDescription");
            t.text("metaKeywords");
            t.text("thumbnail");
            t.string("thumbnailCaption", 255);
        })
        .createTable("productTags", t => {
            t.integer("productId").unsigned().notNullable();
            t.integer("tagId").unsigned().notNullable();
            t.foreign("productId").references("products.id");
            t.foreign("tagId").references("tags.id");
            t.unique(["productId", "tagId"]);
        })
        .createTable("relatedProducts", t => {
            t.integer("productId").unsigned().notNullable();
            t.integer("relatedProductId").unsigned().notNullable();
            t.foreign("productId").references("products.id");
            t.foreign("relatedProductId").references("products.id");
            t.unique(["productId", "relatedProductId"]);
        }).then(() => db("products").insert((products as Product[]).map<NewProduct>(p => ({
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

            descriptionShort: p.short_description,
            productType: p.type_id ==="downloadable" ? "digital" : "grouped",
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
            thumbnail: p.thumbnail,
            thumbnailCaption: p.thumbnail_label,
        }))))
}