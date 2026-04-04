'use client';
// TrackVideo.tsx — embeds a YouTube video for the selected track
// Ported from TrackVideo.js in the original React app
// Uses track.video (the Next.js API field name mapped from video_url in the DB)

import { Track } from '@/app/lib/types';

interface TrackVideoProps {
  selectedTrack: Track | null;
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (url.includes('youtube.com/watch')) {
      const parsed = new URL(url);
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (url.includes('youtube.com/embed/')) return url;
    return '';
  } catch {
    return '';
  }
}

export default function TrackVideo({ selectedTrack }: TrackVideoProps) {
  if (!selectedTrack) {
    return <p className="text-muted">Select a track to view its video.</p>;
  }

  const embedUrl = getEmbedUrl(selectedTrack.video ?? '');

  if (!embedUrl) {
    return <p className="text-muted">No video available for this track.</p>;
  }

  return (
    <div className="ratio ratio-16x9 mt-2" style={{ maxWidth: '640px' }}>
      <iframe
        src={embedUrl}
        title={`${selectedTrack.title} video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
