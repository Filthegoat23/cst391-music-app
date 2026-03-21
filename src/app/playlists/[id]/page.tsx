'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Playlist, Track } from '@/app/lib/types';

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [trackIdInput, setTrackIdInput] = useState('');
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchPlaylist() {
    try {
      const res = await fetch(`/api/playlists/${id}`);
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

  useEffect(() => { fetchPlaylist(); }, [id]);

  async function addTrack(e: React.FormEvent) {
    e.preventDefault();
    const trackId = parseInt(trackIdInput, 10);
    if (isNaN(trackId)) return;
    const res = await fetch(`/api/playlists/${id}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: trackId, position: playlist?.tracks?.length ?? 0 }),
    });
    if (res.ok) {
      setTrackIdInput('');
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

  if (loading) return <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}><p>Loading...</p></main>;
  if (error) return <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}><p style={{ color: 'red' }}>{error}</p><Link href="/playlists">Back</Link></main>;

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Link href="/playlists" style={{ color: '#0070f3', fontSize: 14 }}>← Back to Playlists</Link>

      <div style={{ marginTop: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        {editing ? (
          <form onSubmit={saveEdit} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={100}
              style={{ flex: 1, padding: '6px 10px', fontSize: 20, border: '1px solid #ccc', borderRadius: 4 }}
            />
            <button type="submit" style={{ padding: '6px 14px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
            <button type="button" onClick={() => setEditing(false)} style={{ padding: '6px 14px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
          </form>
        ) : (
          <>
            <h1 style={{ margin: 0 }}>{playlist?.name}</h1>
            <button onClick={() => setEditing(true)} style={{ padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>Rename</button>
            <button onClick={deletePlaylist} style={{ padding: '4px 12px', background: '#e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>Delete Playlist</button>
          </>
        )}
      </div>

      <h2 style={{ fontSize: 18 }}>Tracks ({playlist?.tracks?.length ?? 0})</h2>

      {playlist?.tracks?.length === 0 && (
        <p style={{ color: '#666' }}>No tracks yet. Add one below.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {playlist?.tracks?.map((track: Track) => (
          <li key={track.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #eee' }}>
            <span>
              <strong>{track.number}.</strong> {track.title}
              <span style={{ color: '#999', fontSize: 13, marginLeft: 8 }}>(ID: {track.id})</span>
            </span>
            <button
              onClick={() => removeTrack(track.id!)}
              style={{ padding: '4px 10px', background: '#e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addTrack} style={{ display: 'flex', gap: 10 }}>
        <input
          type="number"
          placeholder="Track ID to add"
          value={trackIdInput}
          onChange={(e) => setTrackIdInput(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button
          type="submit"
          style={{ padding: '8px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}
        >
          Add Track
        </button>
      </form>
      <p style={{ color: '#999', fontSize: 13, marginTop: 6 }}>Enter the track ID from your database.</p>
    </main>
  );
}
