'use client';
// playlists/[id]/page.tsx — Playlist Detail Page
// RBAC:
//   Guest   → redirected to sign in
//   User    → can view tracks only
//   Admin   → can rename, delete playlist and add/remove tracks

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Playlist, Album, Track } from '@/app/lib/types';

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // All albums with tracks — used to populate the track picker
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [trackSearch, setTrackSearch] = useState('');

  const isAdmin = session?.user?.role === 'admin';

  // Redirect guests to sign in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin');
  }, [status, router]);

  async function fetchPlaylist() {
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (res.status === 401) { router.push('/api/auth/signin'); return; }
      if (!res.ok) { setError('Playlist not found'); return; }
      const data = await res.json();
      setPlaylist(data);
      setEditName(data.name);
    } catch {
      setError('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  }

  // Load all albums so admin can pick a track by name
  async function fetchAlbums() {
    try {
      const res = await fetch('/api/albums');
      const data = await res.json();
      setAlbums(data);
    } catch {
      // Non-critical — just means the picker won't have options
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPlaylist();
      if (isAdmin) fetchAlbums();
    }
  }, [id, status, isAdmin]);

  // Flatten all tracks from all albums into a searchable list
  const allTracks = albums.flatMap((album) =>
    (album.tracks ?? []).map((track) => ({
      ...track,
      albumTitle: album.title,
      albumArtist: album.artist,
    }))
  );

  // Filter tracks by search phrase
  const filteredTracks = trackSearch.trim()
    ? allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(trackSearch.toLowerCase()) ||
          t.albumTitle.toLowerCase().includes(trackSearch.toLowerCase())
      )
    : allTracks;

  async function addTrack(e: React.FormEvent) {
    e.preventDefault();
    const trackId = parseInt(selectedTrackId, 10);
    if (isNaN(trackId)) return;

    // Check if track is already in the playlist
    const alreadyAdded = playlist?.tracks?.some((t) => t.id === trackId);
    if (alreadyAdded) {
      alert('That track is already in this playlist.');
      return;
    }

    const res = await fetch(`/api/playlists/${id}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: trackId, position: playlist?.tracks?.length ?? 0 }),
    });
    if (res.ok) {
      setSelectedTrackId('');
      setTrackSearch('');
      fetchPlaylist();
    } else {
      const data = await res.json();
      alert(data.error ?? 'Failed to add track');
    }
  }

  async function removeTrack(trackId: number) {
    await fetch(`/api/playlists/${id}/songs/${trackId}`, { method: 'DELETE' });
    fetchPlaylist();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;
    await fetch(`/api/playlists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditing(false);
    fetchPlaylist();
  }

  async function deletePlaylist() {
    if (!confirm('Delete this playlist?')) return;
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    router.push('/playlists');
  }

  if (status === 'loading' || loading) {
    return <main className="container mt-4"><p className="text-muted">Loading...</p></main>;
  }

  if (error) {
    return (
      <main className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Link href="/playlists" className="btn btn-secondary">Back to Playlists</Link>
      </main>
    );
  }

  return (
    <main className="container mt-4">
      <Link href="/playlists" className="text-muted text-decoration-none">← Back to Playlists</Link>

      {/* Playlist title + admin controls */}
      <div className="d-flex align-items-center gap-3 mt-3 mb-4">
        {editing ? (
          <form onSubmit={saveEdit} className="d-flex gap-2 flex-fill">
            <input
              className="form-control"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={100}
            />
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <>
            <h1 className="mb-0">{playlist?.name}</h1>
            {isAdmin && (
              <>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(true)}>Rename</button>
                <button className="btn btn-outline-danger btn-sm" onClick={deletePlaylist}>Delete</button>
              </>
            )}
          </>
        )}
      </div>

      {/* Track list */}
      <h5>Tracks ({playlist?.tracks?.length ?? 0})</h5>
      {playlist?.tracks?.length === 0 && (
        <p className="text-muted">{isAdmin ? 'No tracks yet — add one below.' : 'No tracks in this playlist.'}</p>
      )}
      <ul className="list-group mb-4">
        {playlist?.tracks?.map((track: Track) => (
          <li key={track.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <strong>{track.number}.</strong> {track.title}
            </span>
            {isAdmin && (
              <button onClick={() => removeTrack(track.id!)} className="btn btn-outline-danger btn-sm">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Add track picker — admin only */}
      {isAdmin && (
        <div className="card p-3">
          <h6 className="mb-3">Add a Track</h6>

          {/* Search box to filter the track list */}
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search by track or album name..."
            value={trackSearch}
            onChange={(e) => setTrackSearch(e.target.value)}
          />

          {/* Scrollable track list */}
          <div className="border rounded mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredTracks.length === 0 && (
              <p className="text-muted p-3 mb-0">No tracks found.</p>
            )}
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className={`p-2 px-3 border-bottom ${selectedTrackId === String(track.id) ? 'bg-primary text-white' : ''}`}
                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                onClick={() => setSelectedTrackId(String(track.id))}
              >
                <strong>{track.title}</strong>
                <span className={`ms-2 ${selectedTrackId === String(track.id) ? 'text-white-50' : 'text-muted'}`}>
                  — {track.albumTitle} · Track {track.number}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={addTrack} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              readOnly
              value={
                selectedTrackId
                  ? allTracks.find((t) => String(t.id) === selectedTrackId)?.title ?? ''
                  : ''
              }
              placeholder="Select a track above..."
            />
            <button type="submit" className="btn btn-primary" disabled={!selectedTrackId}>
              Add
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
