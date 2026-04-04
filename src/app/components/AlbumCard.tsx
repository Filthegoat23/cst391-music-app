// AlbumCard.tsx — reusable component for displaying a single album card
// Not independently routed — included by other pages/components
// Uses Next.js router directly so no routing callbacks needed from parent

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Album } from '@/app/lib/types';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card mb-3" style={{ width: '18rem' }}>
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
        <h6 className="card-subtitle mb-2 text-muted">{album.artist} — {album.year}</h6>
        <p className="card-text" style={{ fontSize: '0.85rem' }}>
          {(album.description ?? '').slice(0, 100)}{(album.description ?? '').length > 100 ? '…' : ''}
        </p>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => router.push(`/show/${album.id}`)}
          >
            View
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => router.push(`/edit/${album.id}`)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
