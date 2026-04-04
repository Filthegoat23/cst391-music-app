// ============================================================
// /api/admin/playlists — Admin Playlist Routes
// Handles: GET all playlists (with track counts), DELETE any playlist
// These routes are intended for admin users only.
// In a future milestone, middleware will check that the
// logged-in user has the admin role before reaching this code.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

// GET /api/admin/playlists
// Returns every playlist in the system, with a track_count column
// showing how many tracks are in each one. Admins use this to
// monitor and moderate all user-created playlists.
export async function GET() {
  try {
    const pool = getPool();

    // Use a subquery to count how many tracks each playlist has.
    // This gives admins a quick overview without needing a separate request.
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

// DELETE /api/admin/playlists?id=<playlistId>
// Allows an admin to delete ANY playlist by passing its ID as a query parameter.
// Unlike the customer delete route which uses a URL segment (/playlists/:id),
// this admin version reads the ID from the query string (?id=X).
// The CASCADE constraint in the DB removes all playlist_tracks rows automatically.
export async function DELETE(request: NextRequest) {
  // Read the ?id= query parameter from the URL
  const url = new URL(request.url);
  const idParam = url.searchParams.get('id');
  const playlistId = parseInt(idParam ?? '', 10);

  // If no valid ID was provided, reject the request
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });

  try {
    const pool = getPool();

    // Delete the playlist — the DB CASCADE handles cleaning up playlist_tracks
    const res = await pool.query('DELETE FROM playlists WHERE id=$1 RETURNING id', [playlistId]);

    if (res.rowCount === 0) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (error) {
    console.error('DELETE /api/admin/playlists error:', error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
