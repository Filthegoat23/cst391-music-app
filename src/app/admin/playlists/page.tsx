'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Playlist } from '@/app/lib/types';

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/admin/playlists');
      const data = await res.json();
      setPlaylists(data);
    } catch {
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPlaylists(); }, []);

  async function deletePlaylist(id: number) {
    if (!confirm(`Delete playlist #${id}?`)) return;
    await fetch(`/api/admin/playlists?id=${id}`, { method: 'DELETE' });
    fetchPlaylists();
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Link href="/playlists" style={{ color: '#0070f3', fontSize: 14 }}>← Back to My Playlists</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 24px' }}>
        <h1 style={{ margin: 0 }}>Admin: All Playlists</h1>
        <Link href="/admin/stats" style={{ color: '#0070f3' }}>View Stats</Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && playlists.length === 0 && (
        <p style={{ color: '#666' }}>No playlists in the system yet.</p>
      )}

      {playlists.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tracks</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map((pl) => (
              <tr key={pl.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px' }}>{pl.id}</td>
                <td style={{ padding: '10px 12px' }}>
                  <Link href={`/playlists/${pl.id}`} style={{ color: '#0070f3' }}>{pl.name}</Link>
                </td>
                <td style={{ padding: '10px 12px' }}>{pl.track_count ?? 0}</td>
                <td style={{ padding: '10px 12px', color: '#666', fontSize: 13 }}>
                  {new Date(pl.created_at!).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button
                    onClick={() => deletePlaylist(pl.id)}
                    style={{ padding: '4px 12px', background: '#e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
