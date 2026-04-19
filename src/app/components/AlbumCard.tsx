'use client';
// AlbumCard.tsx — renders a single album as a Bootstrap card.
// Uses useSession() to enforce role-based UI visibility:
//   Guest   → no View or Edit buttons
//   User    → View only
//   Admin   → View and Edit

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Album } from '@/app/lib/types';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter();

  // Track whether the album image failed to load so we can hide it gracefully
  const [imgError, setImgError] = useState(false);

  // Get the current session to determine what the user is allowed to see
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="card mb-3" style={{ width: '18rem' }}>

      {/* Only render the image if a URL exists and it loaded without error */}
      {album.image && !imgError ? (
        <img
          src={album.image}
          className="card-img-top"
          alt={album.title}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : null}

      <div className="card-body">
        <h5 className="card-title">{album.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          {album.artist} — {album.year}
        </h6>

        {/* Truncate long descriptions so the card grid stays visually consistent */}
        <p className="card-text" style={{ fontSize: '0.85rem' }}>
          {(album.description ?? '').slice(0, 100)}
          {(album.description ?? '').length > 100 ? '…' : ''}
        </p>

        <div className="d-flex gap-2">
          {/* View is visible to authenticated users only (not guests) */}
          {isAuthenticated && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => router.push(`/show/${album.id}`)}
            >
              View
            </button>
          )}

          {/* Edit is visible to admins only */}
          {isAdmin && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => router.push(`/edit/${album.id}`)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
