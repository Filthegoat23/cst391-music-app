import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';
import { Album } from '@/app/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const res = await pool.query('SELECT DISTINCT artist FROM albums ORDER BY artist');
    const artists = res.rows.map((r: Album) => r.artist);
    return NextResponse.json(artists);
  } catch (error) {
    console.error('GET /api/artists error:', error);
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}
