'use client';
// SearchAlbum.tsx — combines SearchForm + AlbumList into one component
// Ported from SearchAlbum.js in the original React app

import { Album } from '@/app/lib/types';
import SearchForm from './SearchForm';
import AlbumList from './AlbumList';

interface SearchAlbumProps {
  albums: Album[];
  onSearch: (phrase: string) => void;
}

export default function SearchAlbum({ albums, onSearch }: SearchAlbumProps) {
  return (
    <div>
      <SearchForm onSubmit={onSearch} />
      <AlbumList albums={albums} />
    </div>
  );
}
