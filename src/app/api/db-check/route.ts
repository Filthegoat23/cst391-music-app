import { NextResponse } from "next/server";
import { Pool } from "pg";

// Persist pool across hot reloads in dev and across warm serverless invocations
let pool: Pool | undefined;

function getConnectionString(): string {
  const dbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("POSTGRES_URL (or DATABASE_URL) not set");
  return dbUrl;
}

function getPool(): Pool {
  if (!pool) {
    const connectionString = getConnectionString();

    pool = new Pool({
      connectionString,
      // Hosted Postgres (Neon/Vercel) requires SSL; locally this is fine to omit
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}

/**
 * Returns a safe summary of the DB target (no password).
 * Example: "ep-...neon.tech/music"
 */
function safeDbTarget(dbUrl?: string | null): string | null {
  if (!dbUrl) return null;
  try {
    const u = new URL(dbUrl);
    const dbName = u.pathname.replace("/", "") || "(no-db)";
    return `${u.hostname}/${dbName}`;
  } catch {
    // If it's not a valid URL (rare), don't leak it
    return "(unparseable)";
  }
}

export async function GET() {
  const environment = process.env.NODE_ENV ?? "development";
  const rawDbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  const dbTarget = safeDbTarget(rawDbUrl);

  try {
    const db = getPool();

    // Basic connection test
    let { rows } = await db.query("select now() as now");
    const now = rows[0]?.now;

    // Verify the music schema exists by querying the albums table
    ({ rows } = await db.query("SELECT artist FROM albums LIMIT 1"));
    const artist = rows[0]?.artist ?? null;

    return NextResponse.json(
      {
        time: now,
        artist,
        message: `Filiberto Meraz III Database connection successful. Running in ${environment}.`,
        dbTarget, // safe: no password
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: (err as Error).message,
        message: `Filiberto Meraz III Database connection failed. Running in ${environment}.`,
        dbTarget, // safe: no password
      },
      { status: 500 }
    );
  }
}