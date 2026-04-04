'use client';
// AlbumList.tsx — renders a grid of AlbumCard components
// Ported from AlbumList.js in the original React app

import { Album } from '@/app/lib/types';
import AlbumCard from './AlbumCard';

interface AlbumListProps {
  albums: Album[];
}

export default function AlbumList({ albums }: AlbumListProps) {
  if (!albums || albums.length === 0) {
    return <p className="text-muted">No albums found.</p>;
  }

  return (
    <div className="d-flex flex-wrap gap-3">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
}
