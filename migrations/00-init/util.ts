import { flatten, trim, unique } from "ts-functional";
import { figureMap, figureSynonyms, translateRequires } from "./figureMap";
import { Product } from "./init";
import { readFileSync } from "fs";

export const getCatNames = (product:Product) =>
    unique(product.categories.map(c => c.name))
        .map(name => figureSynonyms[name] || name)
        .map(n => `Category:${n}`);

export const getTags = (product:Product) => flatten(unique([
    (product.figure || ""               ).split(",").filter((a:string) => !!a).map((v:string) => `Figures:${figureMap[`${v}`]}` || `__Unknown Figure: ${v}`),
    (product.daz_studio_version || ""   ).split(",").filter((a:any) => !!a).map((v:string) => "Programs:DAZ Studio"),
    (product.poser_version || ""        ).split(",").filter((a:any) => !!a).map((v:string) => "Programs:Poser"),
    ...(product.requires || ""          ).split(",").map(trim).filter((a:any) => !!a).map(translateRequires),
    getCatNames(product),
]));

export const loadJsonFile = (path: string) => JSON.parse(readFileSync(path, 'utf-8'));