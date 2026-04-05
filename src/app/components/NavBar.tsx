'use client';
// NavBar.tsx — shared component, lives in /components (not routed)
// Uses Next.js <Link> instead of react-router-dom
// Bootstrap JS is loaded via CDN in layout.tsx

import Link from 'next/link';

export default function NavBar() {

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
