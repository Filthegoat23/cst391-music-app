"use client";
// SessionWrapper.tsx
// Wraps the app in NextAuth's SessionProvider so any client component
// can call useSession() to access the logged-in user's data.
// This must be a Client Component because SessionProvider uses React context.

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
