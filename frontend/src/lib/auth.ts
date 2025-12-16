// lib/auth.ts Configuración de autenticación
import { AuthOptions } from 'next-auth';

export const opcionesAuth: AuthOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

// Funciones de autenticación
export const serviciosAuth = {
  verificarAutenticacion: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  obtenerToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  cerrarSesion: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  },

  establecerToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
};