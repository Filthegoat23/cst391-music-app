import { Pool } from "pg";

// Persist across hot reloads in dev and across warm serverless invocations
let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const URL =
      process.env.MUSIC_DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL;

    if (!URL) throw new Error("Database URL not set");

    pool = new Pool({
      connectionString: URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }

  return pool;
}