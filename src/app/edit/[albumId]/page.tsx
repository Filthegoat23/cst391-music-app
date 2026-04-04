'use client';
// app/edit/[albumId]/page.tsx — Edit OR Create Album page
// When accessed via /edit/:id  → edit mode (loads existing album, sends PUT)
// When accessed via /new       → create mode (blank form, sends POST)
// The /new/page.tsx re-exports this component so the same code handles both routes.

import { get } from '@/lib/apiClient';
import { Album, Track } from '@/app/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EditAlbumPage() {
  const router = useRouter();
  const params = useParams();

  // albumId is present when editing, undefined when creating (/new)
  const albumId = params?.albumId as string | undefined;

  const defaultAlbum: Album = {
    id: 0,
    title: '',
    artist: '',
    description: '',
    year: new Date().getFullYear(),
    image: '',
    tracks: [],
  };

  const [album, setAlbum] = useState<Album>(defaultAlbum);
  const [error, setError] = useState('');

  // Track form fields
  const [trackTitle, setTrackTitle] = useState('');
  const [trackLyrics, setTrackLyrics] = useState('');
  const [trackVideo, setTrackVideo] = useState('');
  const [editingTrackIdx, setEditingTrackIdx] = useState<number | null>(null);

  // Load existing album data when in edit mode
  useEffect(() => {
    if (!albumId) return; // create mode — nothing to load
    get<Album>(`/albums/${albumId}`)
      .then((data) => setAlbum(data))
      .catch(() => setError('Failed to load album.'));
  }, [albumId]);

  // Generic field updater for album fields
  const onChange =
    (key: keyof Album) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAlbum((prev) => ({ ...prev, [key]: e.target.value }));

  // Add a new track to the local list
  const handleAddTrack = () => {
    if (!trackTitle.trim()) {
      setError('Track title is required.');
      return;
    }
    const newTrack: Track = {
      number: (album.tracks?.length ?? 0) + 1,
      title: trackTitle.trim(),
      lyrics: trackLyrics.trim() || null,
      video: trackVideo.trim() || null,
    };
    setAlbum((prev) => ({ ...prev, tracks: [...(prev.tracks ?? []), newTrack] }));
    setTrackTitle('');
    setTrackLyrics('');
    setTrackVideo('');
    setError('');
  };

  const startEditTrack = (idx: number) => {
    const t = album.tracks?.[idx];
    if (!t) return;
    setEditingTrackIdx(idx);
    setTrackTitle(t.title);
    setTrackLyrics(t.lyrics ?? '');
    setTrackVideo(t.video ?? '');
  };

  const saveTrackEdit = () => {
    if (editingTrackIdx === null) return;
    if (!trackTitle.trim()) { setError('Track title is required.'); return; }
    setAlbum((prev) => {
      const updated = [...(prev.tracks ?? [])];
      updated[editingTrackIdx] = {
        ...updated[editingTrackIdx],
        title: trackTitle.trim(),
        lyrics: trackLyrics.trim() || null,
        video: trackVideo.trim() || null,
      };
      return { ...prev, tracks: updated };
    });
    setEditingTrackIdx(null);
    setTrackTitle(''); setTrackLyrics(''); setTrackVideo('');
    setError('');
  };

  const removeTrack = (idx: number) => {
    setAlbum((prev) => ({
      ...prev,
      tracks: (prev.tracks ?? []).filter((_, i) => i !== idx).map((t, i) => ({ ...t, number: i + 1 })),
    }));
    if (editingTrackIdx === idx) {
      setEditingTrackIdx(null);
      setTrackTitle(''); setTrackLyrics(''); setTrackVideo('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!album.title.trim() || !album.artist.trim() || !album.year) {
      setError('Title, artist, and year are required.');
      return;
    }

    const method = albumId ? 'PUT' : 'POST';
    const url = albumId ? `/api/albums/${albumId}` : '/api/albums';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: album.title.trim(),
          artist: album.artist.trim(),
          description: album.description?.trim() ?? '',
          year: Number(album.year),
          image: album.image?.trim() ?? '',
          tracks: album.tracks ?? [],
        }),
      });
      router.push('/');
    } catch {
      setError(albumId ? 'Failed to update album.' : 'Failed to create album.');
    }
  };

  return (
    <main className="container mt-4" style={{ maxWidth: '700px' }}>
      <h1 className="mb-4">{albumId ? 'Edit Album' : 'Create Album'}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Album fields */}
        <div className="mb-3">
          <label className="form-label">Album Title</label>
          <input className="form-control" value={album.title} onChange={onChange('title')} placeholder="Album title" />
        </div>
        <div className="mb-3">
          <label className="form-label">Artist</label>
          <input className="form-control" value={album.artist} onChange={onChange('artist')} placeholder="Artist name" />
        </div>
        <div className="mb-3">
          <label className="form-label">Year</label>
          <input className="form-control" type="number" value={album.year} onChange={onChange('year')} placeholder="Year" />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} value={album.description ?? ''} onChange={onChange('description')} placeholder="Description" />
        </div>
        <div className="mb-4">
          <label className="form-label">Image URL</label>
          <input className="form-control" value={album.image ?? ''} onChange={onChange('image')} placeholder="https://..." />
        </div>

        <hr />
        <h3 className="mb-3">Tracks</h3>

        {/* Track input fields */}
        <div className="mb-2">
          <label className="form-label">Track Title {editingTrackIdx !== null ? '(editing)' : ''}</label>
          <input className="form-control" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} placeholder="Track title" />
        </div>
        <div className="mb-2">
          <label className="form-label">Lyrics</label>
          <textarea className="form-control" rows={2} value={trackLyrics} onChange={(e) => setTrackLyrics(e.target.value)} placeholder="Lyrics (optional)" />
        </div>
        <div className="mb-3">
          <label className="form-label">Video URL</label>
          <input className="form-control" value={trackVideo} onChange={(e) => setTrackVideo(e.target.value)} placeholder="YouTube URL (optional)" />
        </div>

        {editingTrackIdx !== null ? (
          <div className="d-flex gap-2 mb-3">
            <button type="button" className="btn btn-primary" onClick={saveTrackEdit}>Save Track</button>
            <button type="button" className="btn btn-light" onClick={() => { setEditingTrackIdx(null); setTrackTitle(''); setTrackLyrics(''); setTrackVideo(''); }}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn btn-info mb-3" onClick={handleAddTrack}>Add Track</button>
        )}

        {/* Track list */}
        {(album.tracks ?? []).length > 0 && (
          <ul className="list-group mb-4">
            {(album.tracks ?? []).map((track, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{track.number}. {track.title}</span>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => startEditTrack(idx)}>Edit</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeTrack(idx)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="d-flex gap-2 justify-content-center">
          <button type="button" className="btn btn-light" onClick={() => router.push('/')}>Cancel</button>
          <button type="submit" className="btn btn-primary">{albumId ? 'Save Changes' : 'Submit'}</button>
        </div>
      </form>
    </main>
  );
}
