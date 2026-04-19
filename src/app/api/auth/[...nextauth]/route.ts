// app/api/auth/[...nextauth]/route.ts
// This is the NextAuth catch-all route handler.
// The folder MUST be named [...nextauth] — NextAuth looks for this exact name
// to bind its entire authentication system to this route.
// It automatically generates these endpoints:
//   /api/auth/signin
//   /api/auth/signout
//   /api/auth/session
//   /api/auth/callback/github
//   /api/auth/csrf
//   /api/auth/error

import NextAuth, {
  type NextAuthOptions,
  type Session,
  type Account,
  type Profile,
} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { JWT } from "next-auth/jwt";

/**
 * Central authOptions — fully typed.
 * This tells TypeScript the shapes of `token`, `session`, etc.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Use GitHub as the OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  // Secret used to sign/encrypt JWT tokens and cookies
  secret: process.env.NEXTAUTH_SECRET,

  // Use JWTs for sessions (no database session storage needed)
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * JWT callback — runs when the token is created or refreshed.
     * We attach the user's email and role here so they travel
     * inside the JWT and are available everywhere.
     */
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: Account | null;
      profile?: Profile | null;
    }): Promise<JWT> {
      // On first sign-in, copy the email from the GitHub profile
      if (account && profile && typeof profile.email === "string") {
        token.email = profile.email;
      }

      // Check if the user's email is in the admin allowlist (set in .env.local)
      const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
      token.role = admins.includes(token.email ?? "") ? "admin" : "user";

      return token;
    },

    /**
     * Session callback — runs whenever useSession() or getServerSession() is called.
     * We copy token.role → session.user.role so the UI can read it.
     */
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user) {
        session.user.role = token.role as "admin" | "user" | undefined;
      }
      return session;
    },
  },
};

// Export GET and POST handlers — NextAuth needs both
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
