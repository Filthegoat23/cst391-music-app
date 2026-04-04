// ============================================================
// /api/admin/stats — Admin Statistics Route
// Handles: GET usage statistics for the playlist feature
// Returns total playlists, total track entries across all playlists,
// and the top 5 most-added tracks.
// This is an admin-only route — future middleware will enforce that.
// ============================================================

import { NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

// GET /api/admin/stats
// Runs three database queries in parallel using Promise.all for efficiency,
// then combines the results into a single response object.
export async function GET() {
  try {
    const pool = getPool();

    // Run all three queries at the same time instead of one after another.
    // Promise.all waits for all of them to finish before moving on.
    const [totalPlaylists, totalEntries, topTracks] = await Promise.all([

      // Count the total number of playlists in the system
      pool.query('SELECT COUNT(*) AS total FROM playlists'),

      // Count all rows in playlist_tracks (total track-to-playlist links)
      pool.query('SELECT COUNT(*) AS total FROM playlist_tracks'),

      // Find the top 5 tracks that appear in the most playlists.
      // We GROUP BY track ID and title, count appearances, then sort descending.
      pool.query(
        `SELECT t.title, t.id, COUNT(*) AS appearances
         FROM playlist_tracks pt
         JOIN tracks t ON t.id = pt.track_id
         GROUP BY t.id, t.title
         ORDER BY appearances DESC
         LIMIT 5`
      ),
    ]);

    // Build the response object with all three stat groups
    return NextResponse.json({
      total_playlists: parseInt(totalPlaylists.rows[0].total),
      total_playlist_entries: parseInt(totalEntries.rows[0].total),
      top_tracks: topTracks.rows,
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
