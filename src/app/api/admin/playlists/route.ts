import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const res = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) AS track_count
       FROM playlists p
       ORDER BY p.created_at DESC`
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('GET /api/admin/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const idParam = url.searchParams.get('id');
  const playlistId = parseInt(idParam ?? '', 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });

  try {
    const pool = getPool();
    const res = await pool.query('DELETE FROM playlists WHERE id=$1 RETURNING id', [playlistId]);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (error) {
    console.error('DELETE /api/admin/playlists error:', error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
