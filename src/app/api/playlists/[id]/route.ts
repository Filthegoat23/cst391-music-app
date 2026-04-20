// ============================================================
// /api/playlists/[id] — Single Playlist Controller (GET, PUT, DELETE)
// Thin controller: reads session, delegates to service, returns HTTP.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';

export const runtime = 'nodejs';

// GET /api/playlists/:id — returns one playlist with tracks (authenticated users only)
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    const playlist = await playlistService.getPlaylist(playlistId, role);
    return NextResponse.json(playlist);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}

// PUT /api/playlists/:id — renames a playlist (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    const body = await request.json();
    const playlist = await playlistService.updatePlaylist(playlistId, body.name, role);
    return NextResponse.json(playlist);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}

// DELETE /api/playlists/:id — deletes a playlist (admin only)
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    await playlistService.deletePlaylist(playlistId, role);
    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}
