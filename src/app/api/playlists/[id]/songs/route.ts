// ============================================================
// /api/playlists/[id]/songs — Add a Track to a Playlist
// Handles: POST to insert a track into a playlist
// This creates a row in the playlist_tracks join table,
// which links a specific track to a specific playlist.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

// POST /api/playlists/:id/songs
// Adds a track to the playlist identified by :id.
// Expects a JSON body with "track_id" and optionally "position".
// If no position is provided it defaults to 0.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Pull the playlist ID out of the URL
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });

  try {
    // Read the track_id (and optional position) from the request body
    const body = await request.json();
    const { track_id, position } = body;

    // track_id is required — we can't add a track without knowing which one
    if (track_id == null) return NextResponse.json({ error: 'Missing track_id' }, { status: 400 });

    const pool = getPool();

    // Insert a new row into playlist_tracks to link the track to this playlist.
    // The ?? operator means: use position if provided, otherwise default to 0.
    const res = await pool.query(
      'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3) RETURNING *',
      [playlistId, track_id, position ?? 0]
    );

    // Return the new join table row with 201 Created
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error(`POST /api/playlists/${id}/songs error:`, error);
    return NextResponse.json({ error: 'Failed to add track to playlist' }, { status: 500 });
  }
}
