// app/api/albums/[slug]/route.ts
// Handles single-album operations by ID (GET, PUT, DELETE)
// The [slug] segment is always treated as a numeric album ID.

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';
import { Album, Track } from '@/app/lib/types';

export const runtime = 'nodejs';

// GET /api/albums/:id — fetch one album with its tracks
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const id = parseInt(slug, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const albumRes = await pool.query('SELECT * FROM albums WHERE id = $1', [id]);

    if (albumRes.rowCount === 0) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    const tracksRes = await pool.query(
      'SELECT * FROM tracks WHERE album_id = $1 ORDER BY number',
      [id]
    );

    const album: Album = {
      ...albumRes.rows[0],
      tracks: tracksRes.rows.map((t) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        lyrics: t.lyrics,
        video: t.video_url,
      })),
    };

    return NextResponse.json(album);
  } catch (error) {
    console.error(`GET /api/albums/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 });
  }
}

// PUT /api/albums/:id — update an album and its tracks
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const id = parseInt(slug, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, artist, year, description, image, tracks } = body;

    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE albums SET title=$1, artist=$2, description=$3, year=$4, image=$5 WHERE id=$6`,
        [title, artist, description ?? null, year, image ?? null, id]
      );

      if (Array.isArray(tracks)) {
        // Delete all existing tracks and re-insert so we handle adds/removes cleanly
        await client.query('DELETE FROM tracks WHERE album_id = $1', [id]);
        for (const t of tracks as Track[]) {
          await client.query(
            `INSERT INTO tracks (album_id, title, number, lyrics, video_url)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, t.title, t.number, t.lyrics ?? null, t.video ?? null]
          );
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ message: 'Album updated successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`PUT /api/albums/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
}

// DELETE /api/albums/:id — delete an album (tracks cascade automatically)
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const id = parseInt(slug, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      'DELETE FROM albums WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ message: `Album ${id} deleted` });
  } catch (error) {
    console.error(`DELETE /api/albums/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
