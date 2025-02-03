import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { at, first, flatten, pipe, prop, split, unique } from "ts-functional";
import { database } from "../../../core/database";
import { IMigration } from "../../../core/database.d";
import { IOrder } from "../../../store-shared/order/types";
import { IProductMedia } from "../../../store-shared/product/types";
import { IUser } from "../../../uac-shared/user/types";
import { discounts } from "../01-discounts";
import { discountsTable, orderLineItemsTable, ordersTable, productFilesTable, productMediaTable, productsTable, productTagsTable, relatedProductsTable, subProductsTable, wishlistsTable } from "../tables";
import { Customer, Product } from "./init.d";
import { insertProducts } from "./product";
import { getTags } from "./util";

const loadJsonFile = (path: string) => JSON.parse(readFileSync(path, 'utf-8'));

const db = database();

export const init:IMigration = {
    down: () => db.schema
        .dropTableIfExists("discounts"      )
        .dropTableIfExists("orderLineItems" )
        .dropTableIfExists("orders"         )
        .dropTableIfExists("wishlists"      )
        .dropTableIfExists("productTags"    )
        .dropTableIfExists("subProducts"    )
        .dropTableIfExists("relatedProducts")
        .dropTableIfExists("productFiles"   )
        .dropTableIfExists("productMedia"   )
        .dropTableIfExists("products"       )
    ,
    up: () => db.schema
        .createTable("products",        productsTable       )
        .createTable("productMedia",    productMediaTable   )
        .createTable("productFiles",    productFilesTable   )
        .createTable("productTags",     productTagsTable    )
        .createTable("wishlists",       wishlistsTable      )
        .createTable("relatedProducts", relatedProductsTable)
        .createTable("subProducts",     subProductsTable    )
        .createTable("orders",          ordersTable         )
        .createTable("orderLineItems",  orderLineItemsTable )
        .createTable("discounts",       discountsTable      )
    ,
    priority: 1,
    initData: async () => {

        console.log("Importing product data");

        const products = loadJsonFile("_data/products.json");
        const customers = loadJsonFile("_data/customers.json");

        const insertedProducts = await insertProducts(products);
        
        // Get a list of all product ids
        const productIds = insertedProducts.map(prop("id"));

        // Load all tags
        const allTags = await db("tags").select("*").then(a => a);

        // Insert the tags, media, and related products
        let i = 1;
        const count = (products as Product[]).length;
        for(const product of (products as Product[])) {
            console.log(`Processing product (${i++} of ${count}) ${product.sku}:${product.name}`);

            // Get the inserted product info
            const insertedProduct = insertedProducts.find(p => p.sku === product.sku);
            if(!insertedProduct) {
                console.log(`  Product ${product.sku} not found`);
                continue;
            }

            // Insert the media for the product
            let insertedMedia:IProductMedia[] = [];
            if(!!insertedProduct && product.images.length > 0) {
                insertedMedia = await db("productMedia").insert(product.images.map(image => ({
                    productId: insertedProduct.id,
                    url: image.file.split("/").pop(),
                    caption: image.label,
                    order: parseInt(image.position),
                })), "*").onConflict().ignore();
            }

            // If the product thumbnail is not among the insertedmedia, we need to insert it manually
            if(product.thumbnail && product.thumbnail !== "no_selection" && !insertedMedia.find(i => i.url === product.thumbnail.split("/").pop())) {
                const [thumbnail] = await db("productMedia").insert({
                    productId: insertedProduct.id,
                    url: product.thumbnail.split("/").pop(),
                    caption: product.thumbnail_label,
                    order: 0,
                }, "*").onConflict().ignore();
                if(thumbnail) {insertedMedia.push(thumbnail);}
            }

            // If the product image is not among the insertedmedia, we need to insert it manually
            if(product.image && product.image !== "no_selection" && !insertedMedia.find(i => i.url === product.image.split("/").pop())) {
                const [mainImage] = await db("productMedia").insert({
                    productId: insertedProduct.id,
                    url: product.image.split("/").pop(),
                    caption: product.image_label,
                    order: 0,
                }, "*").onConflict().ignore();
                if(mainImage) {insertedMedia.push(mainImage);}
            }

            // Copy all images from original location to S3 and update the URLs
            const copyImages = false;
            if(copyImages && insertedMedia.length > 0) {
                const originalFolder = "A:/evilinnocence.com/_data/images";
                const s3Bucket = "evilinnocence";
                const s3Path = "media/product";
                const s3Client = new S3Client({
                    region: "us-east-1",
                    // Make sure timeouts are long
                    requestHandler: {
                        requestTimeout: 1200000,
                    }
                });

                await Promise.all(insertedMedia.map(async image => {
                    // Get the S3 file key from the last part of the image URL
                    const fileName = image.url;
                    const key = `${s3Path}/${insertedProduct.id}/${fileName}`;

                    // Update the url for the image to be the fileName instead
                    await db("productMedia").where({ id: image.id }).update({ url: fileName });

                    // See if the file already exists in S3
                    const existsCommand = new HeadObjectCommand({ Bucket: s3Bucket, Key: key });
                    try {
                        await s3Client.send(existsCommand);
                        console.log(`  [EXISTS] ${key}  Skipping...`);
                        return;
                    } catch(e) {
                        // If the file does not exist, continue

                        // Fetch the original image
                        // Append the first two letter of the image URL to the originalPath
                        // For example: afdiana.png => \a\f\afdiana.png
                        const originalPath = `${originalFolder}\\${image.url[0]}\\${image.url[1]}\\${image.url}`;
                        const originalFile = readFileSync(originalPath);
                        console.log(`  [LOADED] ${originalPath}`);

                        if(!originalFile) {
                            console.log(`  [NOT FOUND] ${originalPath}`);
                            return;
                        }

                        // Upload the image to S3
                        const command = new PutObjectCommand({
                            Bucket: s3Bucket,
                            Key: key,
                            Body: originalFile,
                            ACL: "public-read",
                            
                        });
                        await s3Client.send(command).then(() => {
                            console.log(`  [COPIED] ${key}`);
                        });
                    }
                }));
            }

            // Update the product with the thumbnail and main image
            console.log(`  Updating thumbnail and main image`);
            const thumbnail = first(insertedMedia.filter(i => i.url === product.thumbnail.split("/").pop()));
            const mainImage = first(insertedMedia.filter(i => i.url === product.image.split("/").pop()));
            if(!!thumbnail) {
                await db("products").where({ id: insertedProduct.id }).update({ thumbnailId: thumbnail.id });
            }
            if(!!mainImage) {
                await db("products").where({ id: insertedProduct.id }).update({ mainImageId: mainImage.id });
            }

            // Calculate the tags for the product
            console.log(`  Updating tags`);
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
            console.log(`  Updating related products`);
            const relatedProducts = product.related_products.filter(r => productIds.includes(r.linked_product_id));

            // Insert the related products
            const relatedPromise = !!insertedProduct && relatedProducts.length > 0
                ? db("relatedProducts").insert(product.related_products.map(r => ({
                    productId: insertedProduct.id,
                    relatedProductId: parseInt(r.linked_product_id),
                })))
                : Promise.resolve();

            // Insert downloadable files
            console.log(`  Inserting downloadable files`);
            const downloadableFiles = !!product.downloadable_links ? product.downloadable_links.filter(l => !!l.link_url) : [];
            const filesPromise = !!insertedProduct && downloadableFiles.length > 0
                ? db("productFiles").insert(downloadableFiles.map(file => ({
                    productId: insertedProduct.id,
                    fileName: file.link_url.split("/")[1],
                    folder: file.link_url.split("/")[0],
                })))
                : Promise.resolve();

            // Wait until the inserts are complete
            await Promise.all([tagsPromise, relatedPromise, filesPromise]);
        }

        // Manually add subproducts for all bundles
        // Search by name and sku
        const bundles:Array<{
            productName: string,
            subProductMatches:Array<{
                name?: string;
                sku?: string;
            }>
        }> = [
            { productName: "All Licenses", subProductMatches: [{name: "License", sku: "SKU-XD4"}]},
            { productName: "3D Universe Girls:  CrossDresser Bundle", subProductMatches: [
                {sku: "SKU-XD4Sara"},{sku: "SKU-XD4Sadie"},{sku: "SKU-XD4Skye"},{sku: "SKU-XD4Staci"}
            ]},
            { productName: "Koshini/Ichiro:  CrossDresser Bundle", subProductMatches: [
                {sku: "SKU-XD4Koshini"},{sku: "SKU-XD4Ichiro"}, {sku: "SKU-XD4Ichiro2"}, {sku: "SKU-XD4Koshini2"}
            ]},
            { productName: "Nursoda Females: CrossDresser Bundle", subProductMatches: [
                {sku: "SKU-XD4Kena"}, {sku: "SKU-XD4KaliKelm"}, {sku: "SKU-XD4Bonga"}, {sku: "SKU-XD4EEPO"}
            ]},
            { productName: "Daz Gen 3 Females: CrossDresser Bundle", subProductMatches: [
                {sku: "SKU-XD4V3"}, {sku: "SKU-XD4SP3"}, {sku: "SKU-XD4Laura3"}, {sku: "SKU-XD4Aiko3"},
            ]},
            { productName: "Daz Gen 3 Males: CrossDresser Bundle", subProductMatches: [
                {sku: "SKU-XD4Luke3"}, {sku: "SKU-XD4Hiro3"}, {sku: "SKU-XD4Mike3"}, {sku: "SKU-XD4DAVID"}, 
            ]},
            { productName: "3D Universe Guys:  CrossDresser Bundle", subProductMatches: [
                {sku: "SKU-XD4Sam"}, {sku: "SKU-XD4Ug"}, {sku: "SKU-XD4Gramps"}, {sku: "SKU-XD4Dennis"}, 
            ]},
        ];
        for(const bundle of bundles) {
            const product = first(insertedProducts.filter(p => p.name.includes("ALL Licenses")));
            const subProducts = flatten(product ? bundle.subProductMatches.map(
                m => insertedProducts.filter(p => (!m.name || p.name.includes(m.name)) && (!m.sku || p.sku.includes(m.sku)))
            ) : []);
            if(!!product && subProducts.length > 0) {
                await db("subProducts").insert(subProducts.map(p => ({
                    productId: product.id,
                    subProductId: p.id,
                }))).onConflict().ignore();
            }
        }

        // Show any duplicate values for customer emails
        (customers as Customer[]).map(prop<Customer, "email">("email")).reduce((acc, email) => {
            if(acc[email]) {
                console.log(`Duplicate email: ${email}`);
            } else {
                acc[email] = true;
            }
            return acc;
        }, {} as Record<string, boolean>);

        // Insert the customer data
        console.log("Importing customer data");

        // For each customer, insert thier order information
        console.log("Importing customer orders");
        for(const customer of (customers as Customer[])) {
            console.log(`Processing customer ${customer.email}`);
            const insertedCustomers:IUser[] = await db("users").insert({
                email: customer.email,
                userName: customer.email,
                passwordHash: "",
                prefix: customer.prefix || "",
                firstName: customer.firstname,
                lastName: customer.lastname,
                suffix: customer.suffix || "",
                createdAt: customer.created_at,
                mustUpdatePassword: true,
            }, "*");
            const insertedCustomer = insertedCustomers[0];
            console.log("  Customer data inserted");
            if(!!insertedCustomer) {
                await db("userRoles").insert({
                    userId: insertedCustomer.id,
                    roleId: 3,
                })
            }
            if(!!insertedCustomer && customer.orders.length > 0) {
                for(const order of customer.orders) {
                    console.log(`  Processing order ${order.entity_id}`);
                    const insertedOrders:IOrder[] = await db("orders").insert({
                        userId: insertedCustomer.id,
                        total: parseFloat(order.grand_total),
                        subtotal: parseFloat(order.subtotal),
                        discount: parseFloat(order.discount_amount),
                        couponCode: order.coupon_code,
                        status: "complete",
                        createdAt: order.created_at,                            
                    }, "*");
                    const insertedOrder = insertedOrders[0];

                    // Determine if line item products do not exist
                    console.log(`  ${order.items}`);
                    const missingProducts = order.items.filter(sku => !insertedProducts.find(p => p.sku === sku));
                    if(missingProducts.length > 0) {
                        console.log(`    Missing products: ${missingProducts}`);
                    }

                    const itemsToInsert = order.items.filter(sku => !missingProducts.includes(sku));
                    if(itemsToInsert.length > 0) {
                        await db("orderLineItems").insert(itemsToInsert.map(sku => ({
                            orderId: insertedOrder.id,
                            productId: insertedProducts.find(p => p.sku === sku)!.id,
                            quantity: 1,
                        })));
                    }
                }
                console.log("  Customer order info inserted");
            }
            if(!!insertedCustomer && customer.wishlist.length > 0) {
                await db("wishlists").insert(customer.wishlist.map(w => ({
                    userId: insertedCustomer.id,
                    productId: w.product_id,
                }))).onConflict().ignore();
                console.log("  Customer wishlist info inserted");
            }
        }

        // Initialize data from discounts migration
        await discounts.initData();
    },
}

