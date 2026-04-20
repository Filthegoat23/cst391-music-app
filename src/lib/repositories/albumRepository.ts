// ============================================================
// albumRepository.ts — Album Data Access Layer
// Responsible for ALL SQL queries related to albums and tracks.
// No business logic lives here — just database operations.
// Routes and services call these functions instead of writing
// SQL directly, keeping the codebase clean and testable.
// ============================================================

import { getPool } from '@/app/lib/db';
import { Album, Track } from '@/app/lib/types';

// Fetch all albums with their tracks attached
export async function getAllAlbums(): Promise<Album[]> {
  const pool = getPool();

  // Get all albums
  const albumsRes = await pool.query('SELECT * FROM albums');
  const albumsData: Album[] = albumsRes.rows;

  if (albumsData.length === 0) return [];

  // Fetch all tracks for these albums in one bulk query (more efficient than one per album)
  const albumIds = albumsData.map((a) => a.id);
  const tracksRes = await pool.query(
    'SELECT * FROM tracks WHERE album_id = ANY($1) ORDER BY number',
    [albumIds]
  );

  // Group tracks by album ID
  const tracksByAlbum: Record<number, Track[]> = {};
  for (const track of tracksRes.rows) {
    (tracksByAlbum[track.album_id] ||= []).push({
      id: track.id,
      number: track.number,
      title: track.title,
      lyrics: track.lyrics,
      video: track.video_url,
    });
  }

  // Attach tracks to each album and return
  return albumsData.map((album) => ({
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    image: album.image,
    description: album.description,
    tracks: tracksByAlbum[album.id] || [],
  }));
}

// Fetch a single album by ID with its tracks
export async function getAlbumById(albumId: number): Promise<Album | null> {
  const pool = getPool();

  const albumRes = await pool.query('SELECT * FROM albums WHERE id = $1', [albumId]);
  if (albumRes.rowCount === 0) return null;

  const album = albumRes.rows[0];

  const tracksRes = await pool.query(
    'SELECT * FROM tracks WHERE album_id = $1 ORDER BY number',
    [albumId]
  );

  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    image: album.image,
    description: album.description,
    tracks: tracksRes.rows.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      lyrics: t.lyrics,
      video: t.video_url,
    })),
  };
}

// Insert a new album and its tracks inside a single database transaction
export async function createAlbum(data: {
  title: string;
  artist: string;
  year: number;
  description?: string | null;
  image?: string | null;
  tracks?: Track[];
}): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert the album and get back the new ID
    const albumRes = await client.query(
      `INSERT INTO albums (title, artist, description, year, image)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.title, data.artist, data.description ?? null, data.year, data.image ?? null]
    );
    const albumId: number = albumRes.rows[0].id;

    // Insert each track linked to the new album
    if (Array.isArray(data.tracks)) {
      for (const t of data.tracks) {
        if (t.title == null || t.number == null) continue;
        await client.query(
          `INSERT INTO tracks (album_id, title, number, lyrics, video_url)
           VALUES ($1, $2, $3, $4, $5)`,
          [albumId, t.title, t.number, t.lyrics ?? null, t.video ?? null]
        );
      }
    }

    await client.query('COMMIT');
    return albumId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Update an existing album and its tracks inside a transaction
export async function updateAlbum(
  albumId: number,
  data: {
    title: string;
    artist: string;
    year: number;
    description?: string | null;
    image?: string | null;
    tracks?: Track[];
  }
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE albums SET title=$1, artist=$2, description=$3, year=$4, image=$5 WHERE id=$6`,
      [data.title, data.artist, data.description ?? null, data.year, data.image ?? null, albumId]
    );

    if (Array.isArray(data.tracks)) {
      for (const t of data.tracks) {
        if (t.id == null) continue;
        await client.query(
          `UPDATE tracks SET number=$1, title=$2, lyrics=$3, video_url=$4 WHERE id=$5 AND album_id=$6`,
          [t.number, t.title, t.lyrics ?? null, t.video ?? null, t.id, albumId]
        );
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Delete an album by ID (tracks are removed via CASCADE in the database)
export async function deleteAlbum(albumId: number): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query('DELETE FROM albums WHERE id=$1 RETURNING id', [albumId]);
  return (res.rowCount ?? 0) > 0;
}
