import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "POSTGRES_URL (or DATABASE_URL) not set",
        },
        { status: 500 }
      );
    }

    const pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });

    const { rows } = await pool.query("select now() as now");
    return NextResponse.json({ time: rows[0]?.now, message: "Database connection successful" });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: (err as Error).message,
      },
      { status: 500 }
    );
  }
}