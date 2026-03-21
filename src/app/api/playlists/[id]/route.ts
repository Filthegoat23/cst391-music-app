import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const pool = getPool();
    const playlistRes = await pool.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);
    if (playlistRes.rowCount === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const tracksRes = await pool.query(
      `SELECT t.*, pt.position FROM tracks t
       JOIN playlist_tracks pt ON pt.track_id = t.id
       WHERE pt.playlist_id = $1
       ORDER BY pt.position`,
      [playlistId]
    );

    return NextResponse.json({ ...playlistRes.rows[0], tracks: tracksRes.rows });
  } catch (error) {
    console.error(`GET /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const pool = getPool();
    const res = await pool.query(
      'UPDATE playlists SET name=$1 WHERE id=$2 RETURNING *',
      [name, playlistId]
    );
    if (res.rowCount === 0) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error(`PUT /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const pool = getPool();
    const res = await pool.query('DELETE FROM playlists WHERE id=$1 RETURNING id', [playlistId]);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
