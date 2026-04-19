'use client';
// NavBar.tsx — shared navigation component
// Uses useSession() to show/hide links based on authentication state:
//   Guest   → sees Sign In only
//   User    → sees Sign Out and About
//   Admin   → sees New Album, About, and Sign Out

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function NavBar() {
  // Get the current session — status is 'loading', 'authenticated', or 'unauthenticated'
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        {/* Brand links to home page — 'Main' nav link removed per Activity 6 */}
        <Link href="/" className="navbar-brand">
          Music App — Filiberto Meraz
        </Link>

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

            {/* Only admins can create new albums */}
            {isAdmin && (
              <li className="nav-item">
                <Link href="/new" className="nav-link">New Album</Link>
              </li>
            )}

            {/* About is visible to all authenticated users */}
            {isAuthenticated && (
              <li className="nav-item">
                <Link href="/about" className="nav-link">About</Link>
              </li>
            )}

            {/* Show Sign In when logged out, Sign Out when logged in */}
            {!isAuthenticated ? (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => signIn('github')}
                >
                  Sign In
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => signOut()}
                >
                  Sign Out
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}
