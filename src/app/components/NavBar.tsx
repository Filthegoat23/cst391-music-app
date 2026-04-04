'use client';
// NavBar.tsx — shared component, lives in /components (not routed)
// Uses Next.js <Link> instead of react-router-dom
// Bootstrap JS loaded dynamically so it only runs in the browser (not SSR)

import Link from 'next/link';
import { useEffect } from 'react';

export default function NavBar() {
  useEffect(() => {
    // @ts-expect-error: Bootstrap's JS bundle lacks TypeScript definitions.
    // Loaded dynamically so it only runs client-side — safe to ignore.
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <span className="navbar-brand">🎵 Music App — Filiberto Meraz</span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link href="/" className="nav-item nav-link">Main</Link>
            </li>
            <li className="nav-item">
              <Link href="/new" className="nav-item nav-link">New Album</Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className="nav-item nav-link">About</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
