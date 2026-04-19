'use client';
// app/show/[albumId]/page.tsx — detailed album view
// Shows album image, info, track list, lyrics, and YouTube video
// Clicking a track updates the lyrics and video panels below

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { get } from '@/lib/apiClient';
import { Album, Track } from '@/app/lib/types';
import TracksList from '@/app/components/TracksList';
import TrackLyrics from '@/app/components/TrackLyrics';
import TrackVideo from '@/app/components/TrackVideo';

export default function ShowAlbumPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params?.albumId as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [error, setError] = useState('');

  // Only admins can see the Edit Album button
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (!albumId) return;
    get<Album>(`/albums/${albumId}`)
      .then((data) => {
        setAlbum(data);
        // Auto-select the first track so lyrics/video panels are not empty
        if (data.tracks && data.tracks.length > 0) {
          setSelectedTrack(data.tracks[0]);
        }
      })
      .catch(() => setError('Could not load this album.'));
  }, [albumId]);

  if (error) {
    return (
      <main className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>Back</button>
      </main>
    );
  }

  if (!album) {
    return <main className="container mt-4"><p className="text-muted">Loading...</p></main>;
  }

  return (
    <main className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          {album.image && (
            <img
              src={album.image}
              alt={album.title}
              className="img-fluid rounded shadow mb-3"
            />
          )}
        </div>
        <div className="col-md-8">
          <h1>{album.title}</h1>
          <h5 className="text-muted">{album.artist} — {album.year}</h5>
          <p className="mt-3">{album.description}</p>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push('/')}>Back</button>
            {/* Only show Edit Album to admins */}
            {isAdmin && (
              <button className="btn btn-outline-primary btn-sm" onClick={() => router.push(`/edit/${albumId}`)}>Edit Album</button>
            )}
          </div>
        </div>
      </div>

      <hr className="mt-4" />

      <div className="row mt-3">
        <div className="col-md-4">
          <h4>Tracks</h4>
          <TracksList
            tracks={album.tracks ?? []}
            selectedTrack={selectedTrack}
            onSelectTrack={setSelectedTrack}
          />
        </div>
        <div className="col-md-8">
          <h4>Lyrics</h4>
          <TrackLyrics selectedTrack={selectedTrack} />

          <h4 className="mt-4">Video</h4>
          <TrackVideo selectedTrack={selectedTrack} />
        </div>
      </div>
    </main>
  );
}
