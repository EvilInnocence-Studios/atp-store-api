import { IMigration } from "../../core/dbMigrations";
import { init } from "./00-init";

export const migrations:IMigration[] = [
    init,
]

export const setupMigrations = [init];