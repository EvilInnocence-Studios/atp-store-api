import { database } from "../../core/database";
import { IMigration } from "../../core/database.d";
import products from "../../../_data/products.json";
import { IProduct, IProductMedia, NewProduct } from "../../store-shared/product/types";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { at, first, flatten, pipe, prop, split, switchOn, trim, unique } from "ts-functional";
import { Index } from "ts-functional/dist/types";

const db = database();

const imageBase = "https:\/\/www.evilinnocence.com\/shop\/media\/catalog\/product";

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
    images: Array<{
        value_id: string;
        file: string;
        label: string;
        position: string;
        disabled: string;
        label_default: string;
        position_default: string;
        disabled_default: string;
        url: string;
        id: string;
        path: string;
    }>;
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
    related_products: Array<{
        link_id: string;
        product_id: string;
        linked_product_id: string;
        link_type_id: string;
    }>;

};

const figureMap:Index<string> = {
	"119":"Wapi Pu",
	"118":"Vincent Parker",
	"117":"Vicky 4 Male",
	"116":"Vicky 3",
	"115":"Vicky 2",
	"114":"Vicky 1",
	"113":"Ugly Boy",
	"112":"Ug!",
	"111":"Toon Baby",
	"110":"The Girl 4",
	"109":"The Girl",
	"108":"The Freak",
	"107":"Terai Yuki 2",
	"106":"Sydney",
	"105":"Stephanie 3 Petite",
	"104":"Staci",
	"125":"Skye",
	"103":"Sara",
	"102":"Sam",
	"101":"Sadie",
	"100":"Rosy Cheeks Lina",
	"99":"Ralphling",
	"98":"Pygmy",
	"97":"Pretty3D Base (V4)",
	"96":"Pretty3D Base (V3)",
	"95":"Preteen Girl",
	"94":"Preteen Boy",
	"93":"Preschool Girl",
	"92":"Preschool Boy",
	"91":"PaperDoll Male",
	"90":"PaperDoll Female",
	"89":"P6 Kate",
	"88":"P6 Jessi",
	"87":"P6 James",
	"86":"P6 Ben",
	"85":"P5 Will",
	"84":"P5 Penny",
	"83":"P5 Judy",
	"82":"P5 Don",
	"81":"P4 Male",
	"80":"P4 Infant",
	"79":"P4 Girl",
	"78":"P4 Female",
	"77":"P4 Boy",
	"76":"Obama",
	"75":"Near Me",
	"74":"Nana",
	"73":"Minotaur",
	"72":"Millennium Baby 3",
	"71":"Miki 2",
	"70":"Miki 1",
	"69":"Mike 3",
	"68":"Mike 2",
	"67":"Mike 1",
	"66":"Maybe",
	"20":"Maya Doll",
	"65":"Matt 3",
	"64":"Mannequin",
	"63":"Maddie 3",
	"62":"Luke 3",
	"61":"Loik",
	"60":"Lil' Bub",
	"129":"Laura 3",
	"59":"LaRoo 2",
	"58":"Kyle 1.5",
	"57":"Kururu",
	"56":"Krystal SF",
	"55":"Krystal",
	"54":"Koshini 2",
	"53":"Koshini",
	"52":"Kit",
	"51":"Kiki",
	"50":"Jinkie",
	"49":"Jager",
	"48":"Ichiro 2",
	"47":"Ichiro",
	"46":"Hiro 4",
	"45":"Hiro 3",
	"44":"HER",
	"43":"Gumdrops",
	"42":"Gramps",
	"41":"Gloria",
	"40":"G2 Koji",
	"39":"G2 Kelvin",
	"37":"G2 Jessi",
	"38":"G2 James",
	"35":"Furrette",
	"36":"Furraldo",
	"34":"FemaSu",
	"33":"F202 Dollie",
	"32":"Evelinne",
	"127":"Eva",
	"31":"E.B.E.",
	"30":"Dennis",
	"29":"Decoco",
	"28":"David 3",
	"27":"CS Raptoid",
	"26":"Clark",
	"25":"Chip",
	"24":"Chibibel",
	"124":"Britta",
	"126":"Bong",
	"23":"Ball Joint Doll",
	"22":"Bacon",
	"21":"Apollo Maximus",
	"19":"Anime Doll",
	"18":"Amanda",
	"17":"Alice 2.0",
	"16":"Alice 1.5",
	"15":"Alexa 2",
	"128":"Aiko 4",
	"14":"Aiko 3",
	"13":"AF Diana",
	"147":"La Femme",
	"150":"Genesis 9",
	"146":"Genesis 8",
	"145":"Genesis 3",
	"142":"Dusk",
	"141":"SuzyQ 2",
	"137":"Michelle",
	"12":"Mike 4",
	"143":"Star",
	"11":"Cookie",
	"10":"Vicky 4",
	"138":"Dawn",

    "Stephanie 4": "Stephanie 4",
    "Yweeb": "Yweeb",
    "The Brute": "The Brute",
    "Anubis": "Anubis",
    "Sidd the Kid": "Sidd the Kid",
    "Gosha": "Gosha",
    "Doctor Pitterbill": "Doctor Pitterbill",
    "Hein": "Hein",
    "Pickles": "Pickles",
}

const figureSynonyms:Index<string> = {
    "V4":"Vicky 4",
    "V3":"Vicky 3",
    "V2":"Vicky 2",
    "V1":"Vicky 1",
    "V4M":"Vicky 4 Male",
    "M4":"Mike 4",
    "M3":"Mike 3",
    "M2":"Mike 2",
    "M1":"Mike 1",
    "A3": "Aiko 3",
    "A4": "Aiko 4",
    "H3": "Hiro 3",
    "H4": "Hiro 4",
    "Koshini2": "Koshini 2",
    "Koshini1": "Koshini",
    "Laura3": "Laura 3",
    "Near_Me": "Near Me",
    "TY2": "Terai Yuki 2",
    "BJD": "Ball Joint Doll",
    "laura3": "Laura 3",
    "NearMe": "Near Me",
    "UG!": "Ug!",
    "Drakelot Minotaur": "Minotaur",
    "V4.2": "Vicky 4",
    "Maddie": "Maddie 3",
    "Matt": "Matt 3",
    "Terai Yuki2": "Terai Yuki 2",
    "Vicky 4.2 Complete": "Vicky 4",
    "Alexa2": "Alexa 2",
    "Michael 4": "Mike 4",
    "AFDiana": "AF Diana",
    "Stephanie Petite 3": "Stephanie 3 Petite",
    "SuzyQ": "SuzyQ 2",
    "Michael 2": "Mike 2",
    "Michael 1": "Mike 1",
    "Michael 3": "Mike 3",
    "Victoria 2": "Vicky 2",
    "Victoria 3": "Vicky 3",
    "Victoria 4": "Vicky 4",
    "Victoria 1": "Vicky 1",
};

const translateRequires = (r:string):string[] => 
    r.includes("CrossDresser 2") ? ["Programs:CrossDresser 2"] :
    r.includes("CrossDresser 2") ? ["Programs:CrossDresser 2"] :
    r.includes("CrossDresser2") ? ["Programs:CrossDresser 2"] :
    r.includes("Crosserdresser 2") ? ["Programs:CrossDresser 2"] :
    r.includes("CrossDresser 3") ? ["Programs:CrossDresser 3"] :
    r.includes("Crossdresser 3") ? ["Programs:CrossDresser 3"] :
    r.includes("CrossDresser 4") ? ["Programs:CrossDresser 3"] :
    r.includes("Crossdresser 4") ? ["Programs:CrossDresser 4"] :
    r.includes("Poser") ? ["Programs:Poser"] :
    Object.values(figureMap).includes(r) ? [`Figures:${r}`] :
    Object.values(figureMap).includes(figureSynonyms[r]) ? [`Figures:${figureSynonyms[r]}`] :

    r === "Anime or Maya Doll" ? ["Figures:Anime Doll", "Figures:Maya Doll"] :
    r === "MayaX Ball Joint Doll" ? ["Figures:Maya Doll", "Figures:Ball Joint Doll"] :
    r === "ADMD" ? ["Figures:Anime Doll", "Figures:Maya Doll"] :
    r === "M2 or M1" ? ["Figures:Mike 2", "Figures:Mike 1"] :
    r === "Anime/Maya Doll" ? ["Figures:Anime Doll", "Figures:Maya Doll"] :
    r === "V2 or V1" ? ["Figures:Vicky 2", "Figures:Vicky 1"] :

    ["__Requires:" + r];


const getTags = (product:Product) => flatten(unique([
    (product.figure || ""            ).split(",").filter((a:string) => !!a).map((v:string) => `Figures:${figureMap[`${v}`]}` || `__Unknown Figure: ${v}`),
    (product.daz_studio_version || "").split(",").filter((a:any) => !!a).map((v:string) => "Programs:DAZ Studio"),
    (product.poser_version || ""     ).split(",").filter((a:any) => !!a).map((v:string) => "Programs:Poser"),
    ...(product.requires || ""          ).split(",").map(trim).filter((a:any) => !!a).map(translateRequires),
]));

export const init:IMigration = {
    down: () => db.schema
        .dropTableIfExists("productTags")
        .dropTableIfExists("relatedProducts")
        .dropTableIfExists("productMedia")
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
            t.integer("thumbnailId").unsigned();
            t.integer("mainImageId").unsigned();
        })
        .createTable("productMedia", t => {
            t.increments().unsigned();
            t.integer("productId").unsigned().notNullable();
            t.string("url", 255).notNullable();
            t.text("caption");
            t.integer("order");
            t.foreign("productId").references("products.id");
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
            thumbnailId: null,
            mainImageId: null,
        })), "*")
        .then(async (insertedProducts:IProduct[]) => {
            // Get a list of all product ids
            const productIds = insertedProducts.map(prop<IProduct, "id">("id"));

            // Load all tags
            const allTags = await db("tags").select("*").then(a => a);

            // Insert the tags, media, and related products
            return Promise.all((products as Product[]).map(async product => {
                // Get the inserted product info
                const insertedProduct = insertedProducts.find(p => p.sku === product.sku);

                // Insert the media for the product
                if(!!insertedProduct && product.images.length > 0) {
                    const insertedMedia:IProductMedia[] = await db("productMedia").insert(product.images.map(image => ({
                        productId: insertedProduct.id,
                        url: image.file,
                        caption: image.label,
                        order: parseInt(image.position),
                    })), "*");

                    // If the product thumbnail is not among the insertedmedia, we need to insert it manually
                    if(!insertedMedia.find(i => i.url === product.thumbnail)) {
                        const [thumbnail] = await db("productMedia").insert({
                            productId: insertedProduct.id,
                            url: product.thumbnail,
                            caption: product.thumbnail_label,
                            order: 0,
                        }, "*");
                        insertedMedia.push(thumbnail);
                    }

                    // If the product image is not among the insertedmedia, we need to insert it manually
                    if(!insertedMedia.find(i => i.url === product.image)) {
                        const [mainImage] = await db("productMedia").insert({
                            productId: insertedProduct.id,
                            url: product.image,
                            caption: product.image_label,
                            order: 0,
                        }, "*");
                        insertedMedia.push(mainImage);
                    }

                    // TODO: Copy all images from original location to S3 and update the URLs

                    // Update the product with the thumbnail and main image
                    const thumbnail = first(insertedMedia.filter(i => i.url === product.thumbnail));
                    const mainImage = first(insertedMedia.filter(i => i.url === product.image));
                    if(!!thumbnail) {
                        await db("products").where({ id: insertedProduct.id }).update({ thumbnailId: thumbnail.id });
                    }
                    if(!!mainImage) {
                        await db("products").where({ id: insertedProduct.id }).update({ mainImageId: mainImage.id });
                    }
                }

                // Calculate the tags for the product
                const tags = getTags(product).filter(t => !t.includes("__")).map(pipe(split(":"), at(1)));
                const tagIds = unique(tags.map(tag => {
                    const existingTag = allTags.find(t => t.name === tag);
                    if(!!existingTag) {
                        return existingTag.id;
                    } else {
                        return -1;
                    }
                })).filter(id => id > 0);

                // Insert the tags
                const tagsPromise = !!insertedProduct && tagIds.length > 0
                    ? db("productTags").insert(tagIds.map(tagId => ({
                        productId: insertedProduct.id,
                        tagId
                    })))
                    : Promise.resolve();

                // Get the related products
                const relatedProducts = product.related_products.filter(r => productIds.includes(parseInt(r.linked_product_id)));

                // Insert the related products
                const relatedPromise = !!insertedProduct && relatedProducts.length > 0
                    ? db("relatedProducts").insert(product.related_products.map(r => ({
                        productId: insertedProduct.id,
                        relatedProductId: parseInt(r.linked_product_id),
                    })))
                    : Promise.resolve();

                // Wait until the inserts are complete
                return Promise.all([tagsPromise, relatedPromise]);
            }))
        })
    )
}