// ============================================================
// playlistRepository.ts — Playlist Data Access Layer
// Responsible for ALL SQL queries related to playlists and
// the playlist_tracks join table.
// No business logic or role checks live here — only SQL.
// ============================================================

import { getPool } from '@/app/lib/db';
import { Playlist } from '@/app/lib/types';

// Fetch all playlists, newest first
export async function getAllPlaylists(): Promise<Playlist[]> {
  const pool = getPool();
  const res = await pool.query('SELECT * FROM playlists ORDER BY created_at DESC');
  return res.rows;
}

// Fetch a single playlist by ID with its tracks joined in
export async function getPlaylistById(playlistId: number): Promise<Playlist | null> {
  const pool = getPool();

  // Look up the playlist itself
  const playlistRes = await pool.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);
  if ((playlistRes.rowCount ?? 0) === 0) return null;

  // Fetch the tracks for this playlist via the join table, ordered by position
  const tracksRes = await pool.query(
    `SELECT t.*, pt.position FROM tracks t
     JOIN playlist_tracks pt ON pt.track_id = t.id
     WHERE pt.playlist_id = $1
     ORDER BY pt.position`,
    [playlistId]
  );

  return { ...playlistRes.rows[0], tracks: tracksRes.rows };
}

// Insert a new playlist and return the created row
export async function createPlaylist(name: string): Promise<Playlist> {
  const pool = getPool();
  const res = await pool.query(
    'INSERT INTO playlists (name) VALUES ($1) RETURNING *',
    [name]
  );
  return res.rows[0];
}

// Rename an existing playlist, return the updated row or null if not found
export async function updatePlaylist(playlistId: number, name: string): Promise<Playlist | null> {
  const pool = getPool();
  const res = await pool.query(
    'UPDATE playlists SET name=$1 WHERE id=$2 RETURNING *',
    [name, playlistId]
  );
  if ((res.rowCount ?? 0) === 0) return null;
  return res.rows[0];
}

// Delete a playlist — CASCADE in the schema removes playlist_tracks rows automatically
export async function deletePlaylist(playlistId: number): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query('DELETE FROM playlists WHERE id=$1 RETURNING id', [playlistId]);
  return (res.rowCount ?? 0) > 0;
}

// Add a track to a playlist via the join table
export async function addTrackToPlaylist(
  playlistId: number,
  trackId: number,
  position: number
): Promise<void> {
  const pool = getPool();
  await pool.query(
    'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3)',
    [playlistId, trackId, position]
  );
}

// Remove a track from a playlist
export async function removeTrackFromPlaylist(
  playlistId: number,
  trackId: number
): Promise<void> {
  const pool = getPool();
  await pool.query(
    'DELETE FROM playlist_tracks WHERE playlist_id=$1 AND track_id=$2',
    [playlistId, trackId]
  );
}
