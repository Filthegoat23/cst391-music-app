// ============================================================
// /api/playlists — Playlist Controller (GET, POST)
// This route is now a thin controller — it:
//   1. Gets the user's session to determine their role
//   2. Delegates to the service layer for business logic + RBAC
//   3. Returns the appropriate HTTP response
// All SQL lives in playlistRepository, all rules in playlistService.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';

export const runtime = 'nodejs';

// GET /api/playlists — returns all playlists (authenticated users only)
export async function GET() {
  try {
    // Get the current user's session and role
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    const playlists = await playlistService.listPlaylists(role);
    return NextResponse.json(playlists);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// POST /api/playlists — creates a new playlist (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    const body = await request.json();
    const playlist = await playlistService.createPlaylist(body.name, role);
    return NextResponse.json(playlist, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    const status = error.status ?? 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
