import { setupMigrations as storeSetup, migrations as storeMigrations } from "./migrations";

export {apiConfig} from "./endpoints";

export const migrations = storeMigrations;
export const setupMigrations = storeSetup;
