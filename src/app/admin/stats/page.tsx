'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Stats = {
  total_playlists: number;
  total_playlist_entries: number;
  top_tracks: { id: number; title: string; appearances: number }[];
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const cardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '20px 28px',
    background: '#fafafa',
    textAlign: 'center',
  };

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <Link href="/admin/playlists" style={{ color: '#0070f3', fontSize: 14 }}>← Back to Admin Playlists</Link>
      <h1 style={{ marginTop: 16 }}>Admin: Playlist Stats</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
            <div style={cardStyle}>
              <p style={{ margin: '0 0 8px', color: '#666', fontSize: 14 }}>Total Playlists</p>
              <p style={{ margin: 0, fontSize: 48, fontWeight: 700 }}>{stats.total_playlists}</p>
            </div>
            <div style={cardStyle}>
              <p style={{ margin: '0 0 8px', color: '#666', fontSize: 14 }}>Total Track Entries</p>
              <p style={{ margin: 0, fontSize: 48, fontWeight: 700 }}>{stats.total_playlist_entries}</p>
            </div>
          </div>

          <h2>Most Added Tracks</h2>
          {stats.top_tracks.length === 0 && (
            <p style={{ color: '#666' }}>No tracks added to playlists yet.</p>
          )}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {stats.top_tracks.map((track, i) => (
              <li
                key={track.id}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #eee' }}
              >
                <span><strong>#{i + 1}</strong> {track.title} <span style={{ color: '#999', fontSize: 13 }}>(ID: {track.id})</span></span>
                <span style={{ color: '#0070f3', fontWeight: 600 }}>{track.appearances} playlist{Number(track.appearances) !== 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
