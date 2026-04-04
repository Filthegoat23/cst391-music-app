// ============================================================
// /api/playlists — Customer Playlist Routes
// Handles: GET all playlists, POST create a new playlist
// These are the base routes for the playlist feature.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/app/lib/db';

// Tell Next.js to run this route on the Node.js runtime
// so we can use the pg (PostgreSQL) database connection
export const runtime = 'nodejs';

// GET /api/playlists
// Returns all playlists from the database, newest first.
// In a future milestone this will be filtered by the logged-in user's ID.
export async function GET() {
  try {
    // Get the shared database connection pool
    const pool = getPool();

    // Query all playlists, ordered by most recently created
    const res = await pool.query('SELECT * FROM playlists ORDER BY created_at DESC');

    // Return the results as JSON
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('GET /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

// POST /api/playlists
// Creates a new playlist. Expects a JSON body with a "name" field.
// Returns the newly created playlist row with status 201 (Created).
export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the playlist name
    const body = await request.json();
    const { name } = body;

    // Validate that a name was provided — reject the request if not
    if (!name) {
      return NextResponse.json({ error: 'Missing playlist name' }, { status: 400 });
    }

    const pool = getPool();

    // Insert the new playlist into the database using a parameterized query
    // $1 is a placeholder that prevents SQL injection
    // RETURNING * gives us back the full row that was just inserted
    const res = await pool.query(
      'INSERT INTO playlists (name) VALUES ($1) RETURNING *',
      [name]
    );

    // Return the new playlist with a 201 Created status
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
