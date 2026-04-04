'use client';
// app/page.tsx — Home page
// Loads all albums from the API, supports search filtering,
// and renders them as a grid of AlbumCards via SearchAlbum.

import { useState, useEffect, useMemo } from 'react';
import { get } from '@/lib/apiClient';
import { Album } from '@/app/lib/types';
import SearchAlbum from './components/SearchAlbum';

export default function Page() {
  const [albumList, setAlbumList] = useState<Album[]>([]);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [error, setError] = useState('');

  // Load all albums from the API on first render
  useEffect(() => {
    get<Album[]>('/albums')
      .then((data) => setAlbumList(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  // Filter albums client-side based on the search phrase
  const filteredAlbums = useMemo(() => {
    const phrase = searchPhrase.trim().toLowerCase();
    if (!phrase) return albumList;
    return albumList.filter((a) => {
      const desc = (a.description ?? '').toLowerCase();
      const title = (a.title ?? '').toLowerCase();
      return desc.includes(phrase) || title.includes(phrase);
    });
  }, [albumList, searchPhrase]);

  return (
    <main className="container mt-3">
      <h1 className="mb-1">CST-391 Music App</h1>
      <p className="text-muted mb-4">Filiberto Meraz — Album count: {albumList.length}</p>

      {/* Show error message if API call failed */}
      {error && (
        <div className="alert alert-danger" role="alert">
          Failed to load albums: {error}
        </div>
      )}

      {/* Show loading message while albums are being fetched */}
      {!error && albumList.length === 0 && (
        <p className="text-muted">Loading albums...</p>
      )}

      {/* Main album search + grid */}
      {!error && albumList.length > 0 && (
        <SearchAlbum albums={filteredAlbums} onSearch={setSearchPhrase} />
      )}
    </main>
  );
}
