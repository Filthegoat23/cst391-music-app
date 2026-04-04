'use client';
// TracksList.tsx — list of track titles, click to select a track
// Ported from TracksList.js + TrackTitle.js in the original React app

import { Track } from '@/app/lib/types';

interface TracksListProps {
  tracks: Track[];
  selectedTrack: Track | null;
  onSelectTrack: (track: Track) => void;
}

export default function TracksList({ tracks, selectedTrack, onSelectTrack }: TracksListProps) {
  if (!tracks || tracks.length === 0) {
    return <p className="text-muted">No tracks available.</p>;
  }

  return (
    <div className="list-group">
      {tracks.map((track) => (
        <button
          key={track.id ?? track.title}
          type="button"
          className={`list-group-item list-group-item-action${selectedTrack?.id === track.id ? ' active' : ''}`}
          onClick={() => onSelectTrack(track)}
        >
          {track.number}. {track.title}
        </button>
      ))}
    </div>
  );
}
