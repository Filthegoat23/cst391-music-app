// ============================================================
// /api/playlists/[id] — Single Playlist Routes
// Handles: GET one playlist, PUT rename it, DELETE remove it
// The [id] in the folder name is a dynamic route parameter
// that Next.js passes in through the context object.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

// GET /api/playlists/:id
// Returns a single playlist along with all of its tracks.
// Uses a JOIN between the tracks table and playlist_tracks join table.
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Extract the dynamic :id segment from the URL
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);

  // Make sure the ID is actually a number before hitting the database
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const pool = getPool();

    // First, look up the playlist itself
    const playlistRes = await pool.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);

    // If no rows came back, that playlist doesn't exist
    if (playlistRes.rowCount === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Now fetch all tracks that belong to this playlist.
    // We JOIN the tracks table with our playlist_tracks join table
    // and order by the position column so tracks come back in the right order.
    const tracksRes = await pool.query(
      `SELECT t.*, pt.position FROM tracks t
       JOIN playlist_tracks pt ON pt.track_id = t.id
       WHERE pt.playlist_id = $1
       ORDER BY pt.position`,
      [playlistId]
    );

    // Combine the playlist data and its tracks into one response object
    return NextResponse.json({ ...playlistRes.rows[0], tracks: tracksRes.rows });
  } catch (error) {
    console.error(`GET /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

// PUT /api/playlists/:id
// Renames an existing playlist. Expects a JSON body with a "name" field.
// Returns the updated playlist row.
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    // Read the new name from the request body
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const pool = getPool();

    // Run an UPDATE query and return the updated row with RETURNING *
    const res = await pool.query(
      'UPDATE playlists SET name=$1 WHERE id=$2 RETURNING *',
      [name, playlistId]
    );

    // If rowCount is 0, the playlist with that ID didn't exist
    if (res.rowCount === 0) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error(`PUT /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

// DELETE /api/playlists/:id
// Deletes a playlist by ID. Because of the CASCADE constraint on the
// playlist_tracks table, all associated track entries are removed automatically.
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const pool = getPool();

    // Delete the playlist — CASCADE in the DB schema handles
    // removing all rows in playlist_tracks automatically
    const res = await pool.query('DELETE FROM playlists WHERE id=$1 RETURNING id', [playlistId]);

    if (res.rowCount === 0) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
