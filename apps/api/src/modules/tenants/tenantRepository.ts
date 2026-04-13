import { env } from "../config/env";
import { TenantRepository } from "./tenantRepository.types";

function resolvePostgresConnection() {
  return env.SUPABASE_DB_URL || env.DATABASE_URL;
}

function createTenantRepository(): TenantRepository {
  if (env.DB_PROVIDER === "sqlite") {
    const { SqliteTenantRepository } = require("./repositories/sqliteTenantRepository") as typeof import("./repositories/sqliteTenantRepository");
    return new SqliteTenantRepository(env.SQLITE_FILE_PATH);
  }

  if (env.DB_PROVIDER === "postgres") {
    const { PostgresTenantRepository } = require("./repositories/postgresTenantRepository") as typeof import("./repositories/postgresTenantRepository");
    const connectionString = resolvePostgresConnection();
    if (!connectionString) {
      throw new Error("DB_PROVIDER=postgres requiere DATABASE_URL o SUPABASE_DB_URL");
    }

    return new PostgresTenantRepository(connectionString);
  }

  const { MemoryTenantRepository } = require("./repositories/memoryTenantRepository") as typeof import("./repositories/memoryTenantRepository");
  return new MemoryTenantRepository();
}

export const tenantRepository = createTenantRepository();
