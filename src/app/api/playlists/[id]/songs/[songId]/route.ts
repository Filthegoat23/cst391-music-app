// ============================================================
// /api/playlists/[id]/songs/[songId] — Remove Track (admin only)
// Thin controller: reads session, delegates to service, returns HTTP.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as playlistService from '@/lib/services/playlistService';

export const runtime = 'nodejs';

// DELETE /api/playlists/:id/songs/:songId — removes a track from a playlist (admin only)
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; songId: string }> }
) {
  const { id, songId } = await context.params;
  const playlistId = parseInt(id, 10);
  const trackId = parseInt(songId, 10);

  if (isNaN(playlistId) || isNaN(trackId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;

    await playlistService.removeTrack(playlistId, trackId, role);
    return NextResponse.json({ message: 'Track removed from playlist' });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}
