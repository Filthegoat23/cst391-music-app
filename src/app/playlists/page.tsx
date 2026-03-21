'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Playlist } from '@/app/lib/types';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      setPlaylists(data);
    } catch {
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlaylists();
  }, []);

  async function createPlaylist(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName('');
      fetchPlaylists();
    }
  }

  async function deletePlaylist(id: number) {
    if (!confirm('Delete this playlist?')) return;
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    fetchPlaylists();
  }

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>My Playlists</h1>

      <form onSubmit={createPlaylist} style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
        <input
          type="text"
          placeholder="New playlist name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={100}
          style={{ flex: 1, padding: '8px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button
          type="submit"
          style={{ padding: '8px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}
        >
          Create
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && playlists.length === 0 && (
        <p style={{ color: '#666' }}>No playlists yet. Create one above!</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, background: '#fafafa' }}
          >
            <h3 style={{ margin: '0 0 8px' }}>{pl.name}</h3>
            <p style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>
              {new Date(pl.created_at!).toLocaleDateString()}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                href={`/playlists/${pl.id}`}
                style={{ flex: 1, textAlign: 'center', padding: '6px 0', background: '#0070f3', color: '#fff', borderRadius: 4, textDecoration: 'none', fontSize: 14 }}
              >
                View
              </Link>
              <button
                onClick={() => deletePlaylist(pl.id)}
                style={{ flex: 1, padding: '6px 0', background: '#e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, borderTop: '1px solid #eee', paddingTop: 20 }}>
        <Link href="/admin/playlists" style={{ marginRight: 16, color: '#0070f3' }}>Admin: All Playlists</Link>
        <Link href="/admin/stats" style={{ color: '#0070f3' }}>Admin: Stats</Link>
      </div>
    </main>
  );
}
