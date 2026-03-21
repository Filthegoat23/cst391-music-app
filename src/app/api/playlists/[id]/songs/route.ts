import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });

  try {
    const body = await request.json();
    const { track_id, position } = body;
    if (track_id == null) return NextResponse.json({ error: 'Missing track_id' }, { status: 400 });

    const pool = getPool();
    const res = await pool.query(
      'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3) RETURNING *',
      [playlistId, track_id, position ?? 0]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error(`POST /api/playlists/${id}/songs error:`, error);
    return NextResponse.json({ error: 'Failed to add track to playlist' }, { status: 500 });
  }
}
