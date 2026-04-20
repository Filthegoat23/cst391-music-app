'use client';
// playlists/page.tsx — Playlist List Page
// RBAC:
//   Guest   → redirected to sign in
//   User    → can view playlists
//   Admin   → can view AND create/delete playlists

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Playlist } from '@/app/lib/types';

export default function PlaylistsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = session?.user?.role === 'admin';

  // Redirect guests to sign in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/playlists');
      if (res.status === 401) { router.push('/api/auth/signin'); return; }
      const data = await res.json();
      setPlaylists(data);
    } catch {
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchPlaylists();
  }, [status]);

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
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to create playlist');
    }
  }

  async function deletePlaylist(id: number) {
    if (!confirm('Delete this playlist?')) return;
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    fetchPlaylists();
  }

  // Show loading while session is being checked
  if (status === 'loading' || loading) {
    return <main className="container mt-4"><p className="text-muted">Loading...</p></main>;
  }

  return (
    <main className="container mt-4">
      <h1 className="mb-1">Playlists</h1>
      <p className="text-muted mb-4">
        {isAdmin ? 'Admin — you can create and delete playlists.' : 'Viewing as user — sign in as admin to manage playlists.'}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Create form — admins only */}
      {isAdmin && (
        <form onSubmit={createPlaylist} className="d-flex gap-2 mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="New playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={100}
          />
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      {playlists.length === 0 && (
        <p className="text-muted">No playlists yet{isAdmin ? ' — create one above!' : '.'}</p>
      )}

      {/* Playlist cards grid */}
      <div className="row g-3">
        {playlists.map((pl) => (
          <div key={pl.id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{pl.name}</h5>
                <p className="card-text text-muted" style={{ fontSize: '0.85rem' }}>
                  {pl.created_at ? new Date(pl.created_at).toLocaleDateString() : ''}
                </p>
              </div>
              <div className="card-footer d-flex gap-2">
                <Link href={`/playlists/${pl.id}`} className="btn btn-primary btn-sm flex-fill">
                  View
                </Link>
                {/* Delete is admin only */}
                {isAdmin && (
                  <button
                    onClick={() => deletePlaylist(pl.id)}
                    className="btn btn-outline-danger btn-sm flex-fill"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
