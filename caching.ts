import { IBehavior } from "../core/cloudfront";

export const storeCaching:IBehavior[] = [
    {precedence: 0, pathPattern: "/product/*/file/*/download", cache: false},
    {precedence: 1, pathPattern: "/product*",                 cache: true },
    {precedence: 2, pathPattern: "/discount*",                cache: true },
];