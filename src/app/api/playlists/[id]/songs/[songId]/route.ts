import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; songId: string }> }
) {
  const { id, songId } = await context.params;
  const playlistId = parseInt(id, 10);
  const trackId = parseInt(songId, 10);
  if (isNaN(playlistId) || isNaN(trackId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const res = await pool.query(
      'DELETE FROM playlist_tracks WHERE playlist_id=$1 AND track_id=$2 RETURNING id',
      [playlistId, trackId]
    );
    if (res.rowCount === 0) return NextResponse.json({ error: 'Track not found in playlist' }, { status: 404 });
    return NextResponse.json({ message: 'Track removed from playlist' });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id}/songs/${songId} error:`, error);
    return NextResponse.json({ error: 'Failed to remove track' }, { status: 500 });
  }
}
