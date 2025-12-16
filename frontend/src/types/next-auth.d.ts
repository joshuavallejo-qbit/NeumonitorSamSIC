// src/types/next-auth.d.ts
import NextAuth from "next-auth";
import { DefaultUser } from "next-auth";

// Extiende el tipo de usuario para incluir 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
