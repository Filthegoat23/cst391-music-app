import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const res = await pool.query('SELECT * FROM playlists ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('GET /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ error: 'Missing playlist name' }, { status: 400 });
    }
    const pool = getPool();
    const res = await pool.query(
      'INSERT INTO playlists (name) VALUES ($1) RETURNING *',
      [name]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
