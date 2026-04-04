// ============================================================
// /api/playlists/[id]/songs/[songId] — Remove a Track
// Handles: DELETE to remove a specific track from a playlist
// This removes the matching row in the playlist_tracks join table.
// The actual track record in the tracks table is NOT deleted —
// only the relationship between this playlist and that track.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

// DELETE /api/playlists/:id/songs/:songId
// Removes a track from a playlist by deleting the row in playlist_tracks
// that matches both the playlist ID and the track ID.
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; songId: string }> }
) {
  // Extract both dynamic segments from the URL:
  // id = the playlist, songId = the track to remove
  const { id, songId } = await context.params;
  const playlistId = parseInt(id, 10);
  const trackId = parseInt(songId, 10);

  // Validate both IDs before touching the database
  if (isNaN(playlistId) || isNaN(trackId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const pool = getPool();

    // Delete the specific entry in the join table where both IDs match.
    // This only removes the track FROM the playlist, not the track itself.
    const res = await pool.query(
      'DELETE FROM playlist_tracks WHERE playlist_id=$1 AND track_id=$2 RETURNING id',
      [playlistId, trackId]
    );

    // If nothing was deleted, the track wasn't in this playlist to begin with
    if (res.rowCount === 0) return NextResponse.json({ error: 'Track not found in playlist' }, { status: 404 });

    return NextResponse.json({ message: 'Track removed from playlist' });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id}/songs/${songId} error:`, error);
    return NextResponse.json({ error: 'Failed to remove track' }, { status: 500 });
  }
}
