// Type augmentation for NextAuth
// This tells TypeScript that session.user has a `role` field
// and that the JWT token has a `role` and `email` field.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "user";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "user";
    email?: string;
  }
}
