import { NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const [totalPlaylists, totalEntries, topTracks] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM playlists'),
      pool.query('SELECT COUNT(*) AS total FROM playlist_tracks'),
      pool.query(
        `SELECT t.title, t.id, COUNT(*) AS appearances
         FROM playlist_tracks pt
         JOIN tracks t ON t.id = pt.track_id
         GROUP BY t.id, t.title
         ORDER BY appearances DESC
         LIMIT 5`
      ),
    ]);

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
