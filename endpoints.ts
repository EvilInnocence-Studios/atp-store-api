import { IApiConfig } from "../core/endpoints";
import {ProductEndpoints} from "./product/endpoints";

export const apiConfig:IApiConfig = {
    ...ProductEndpoints,
}
