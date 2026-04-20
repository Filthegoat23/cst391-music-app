// ============================================================
// /api/playlists/[id]/songs — Add Track to Playlist (admin only)
// Thin controller: reads session, delegates to service, returns HTTP.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';

export const runtime = 'nodejs';

// POST /api/playlists/:id/songs — adds a track to the playlist (admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });

  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    const body = await request.json();
    const { track_id, position } = body;

    if (track_id == null) return NextResponse.json({ error: 'Missing track_id' }, { status: 400 });

    await playlistService.addTrack(playlistId, track_id, position ?? 0, role);
    return NextResponse.json({ message: 'Track added' }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}
