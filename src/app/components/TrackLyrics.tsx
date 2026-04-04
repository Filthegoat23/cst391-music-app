'use client';
// TrackLyrics.tsx — displays lyrics for the selected track
// Ported from TrackLyrics.js in the original React app

import { Track } from '@/app/lib/types';

interface TrackLyricsProps {
  selectedTrack: Track | null;
}

export default function TrackLyrics({ selectedTrack }: TrackLyricsProps) {
  if (!selectedTrack) {
    return <p className="text-muted">Select a track to see lyrics.</p>;
  }

  return (
    <div>
      <strong>{selectedTrack.title}</strong>
      <p className="mt-2">{selectedTrack.lyrics || 'No lyrics available.'}</p>
    </div>
  );
}
