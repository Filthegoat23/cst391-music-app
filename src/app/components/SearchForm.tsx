'use client';
// SearchForm.tsx — search input bar
// Ported from SearchForm.js in the original React app

import { useState } from 'react';

interface SearchFormProps {
  onSubmit: (phrase: string) => void;
}

export default function SearchForm({ onSubmit }: SearchFormProps) {
  const [searchPhrase, setSearchPhrase] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(searchPhrase);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Search albums by description..."
          value={searchPhrase}
          onChange={(e) => setSearchPhrase(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        {searchPhrase && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => { setSearchPhrase(''); onSubmit(''); }}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
