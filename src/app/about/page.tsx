// app/about/page.tsx — About page
// This is a SERVER COMPONENT (no 'use client' directive).
// It renders entirely on the server and sends plain HTML to the browser.
// Server components cannot use React hooks or browser APIs.
// This is ideal for static/read-only content like an About page
// because it loads instantly and is fully visible to search engines.

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="container mt-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body text-center p-5">

          <div className="mb-4">
            <span style={{ fontSize: '4rem' }}>🎵</span>
          </div>

          <h1 className="card-title mb-1">CST-391 Music App</h1>
          <h5 className="text-muted mb-4">Built with Next.js, TypeScript &amp; PostgreSQL</h5>

          <hr />

          <h4 className="mt-4">About the Developer</h4>
          <p className="lead mt-2">
            <strong>Filiberto Meraz</strong>
          </p>
          <p className="text-muted">
            Grand Canyon University — CST-391 JavaScript Web Application Development
          </p>

          <hr />

          <h5 className="mt-4">About This App</h5>
          <p className="mt-2">
            This music app lets you browse, search, create, and edit albums and their tracks.
            It was built by porting a React application into a Next.js project so the frontend
            and backend share a single codebase deployed on Vercel.
          </p>

          <ul className="list-group list-group-flush mt-3 text-start">
            <li className="list-group-item">✅ Next.js App Router with TypeScript</li>
            <li className="list-group-item">✅ PostgreSQL database via Vercel Postgres</li>
            <li className="list-group-item">✅ Bootstrap 5 for styling</li>
            <li className="list-group-item">✅ Server &amp; Client components</li>
            <li className="list-group-item">✅ Playlist feature with RBAC design</li>
          </ul>

          <div className="mt-4">
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>

          <p className="text-muted mt-4" style={{ fontSize: '0.8rem' }}>
            This page is rendered using <strong>Server-Side Rendering (SSR)</strong>.
            It has no &ldquo;use client&rdquo; directive, which means it runs entirely
            on the server and sends plain HTML to the browser — no JavaScript needed
            for the initial render. This makes it fast to load and fully indexable by search engines.
          </p>

        </div>
      </div>
    </main>
  );
}
