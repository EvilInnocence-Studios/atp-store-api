import { IMigration } from "@core/dbMigrations";
import { database } from "../../../core/database";
import {
    discountsTable, orderLineItemsTable, ordersTable, productFilesTable, productMediaTable,
    productsTable, productTagsTable, relatedProductsTable, subProductsTable, wishlistsTable
} from "../tables";
import { insertPermissions, insertRolePermissions, insertRoles } from "../../../uac/migrations/util";

const db = database();

const roles = [
    { name: "Customer",  description: "Store customer"    },
];

const permissions = [
    { name: "product.view",         description: "Can view products"     },
    { name: "product.update",       description: "Can update products"   },
    { name: "product.create",       description: "Can create products"   },
    { name: "product.delete",       description: "Can delete products"   },

    { name: "media.view",           description: "Can view media"        },
    { name: "media.update",         description: "Can update media"      },
    { name: "media.create",         description: "Can create media"      },
    { name: "media.delete",         description: "Can delete media"      },

    { name: "order.view",           description: "Can view orders"       },
    { name: "order.update",         description: "Can update orders"     },
    { name: "order.create",         description: "Can create orders"     },
    { name: "order.delete",         description: "Can delete orders"     },

    { name: "order.purchase",       description: "Can purchase an order" },
    
    { name: "discount.view",        description: "Can view discounts"    },
    { name: "discount.update",      description: "Can update discounts"  },
    { name: "discount.create",      description: "Can create discounts"  },
    { name: "discount.delete",      description: "Can delete discounts"  },
];

const rolePermissions = [
    { roleName: "SuperUser", permissionName: "product.view" },
    { roleName: "SuperUser", permissionName: "product.update" },
    { roleName: "SuperUser", permissionName: "product.create" },
    { roleName: "SuperUser", permissionName: "product.delete" },
    { roleName: "SuperUser", permissionName: "media.view" },
    { roleName: "SuperUser", permissionName: "media.update" },
    { roleName: "SuperUser", permissionName: "media.create" },
    { roleName: "SuperUser", permissionName: "media.delete" },
    { roleName: "SuperUser", permissionName: "order.view" },
    { roleName: "SuperUser", permissionName: "order.update" },
    { roleName: "SuperUser", permissionName: "order.create" },
    { roleName: "SuperUser", permissionName: "order.delete" },
    { roleName: "SuperUser", permissionName: "discount.view" },
    { roleName: "SuperUser", permissionName: "discount.update" },
    { roleName: "SuperUser", permissionName: "discount.create" },
    { roleName: "SuperUser", permissionName: "discount.delete" },
    { roleName: "Public", permissionName: "product.view" },
    { roleName: "Public", permissionName: "media.view" },
    { roleName: "Customer", permissionName: "user.create" },
    { roleName: "Customer", permissionName: "tag.view" },
    { roleName: "Customer", permissionName: "product.view" },
    { roleName: "Customer", permissionName: "media.view" },
    { roleName: "Customer", permissionName: "synonym.view" },
    { roleName: "Customer", permissionName: "banner.view" },
    { roleName: "Customer", permissionName: "order.view" },
    { roleName: "Customer", permissionName: "order.update" },
    { roleName: "Customer", permissionName: "order.create" },
    { roleName: "Customer", permissionName: "order.delete" },
    { roleName: "Customer", permissionName: "order.purchase" },
];

export const init:IMigration = {
    name: "init",
    module: "store",
    description: "Initialize the store module",
    order: 0,
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
        .dropTableIfExists("products"       ),
    up: async () => db.schema
        .createTable("products",        productsTable       )
        .createTable("productMedia",    productMediaTable   )
        .createTable("productFiles",    productFilesTable   )
        .createTable("productTags",     productTagsTable    )
        .createTable("relatedProducts", relatedProductsTable)
        .createTable("subProducts",     subProductsTable    )
        .createTable("wishlists",       wishlistsTable      )
        .createTable("orders",          ordersTable         )
        .createTable("orderLineItems",  orderLineItemsTable )
        .createTable("discounts",       discountsTable      ),
    initData: () => Promise.all([
        insertRoles(db, roles),
        insertPermissions(db, permissions),
        insertRolePermissions(db, rolePermissions),

    ]),
}

