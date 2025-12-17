// frontend/src/lib/auth.ts
import { AuthOptions } from 'next-auth';

export const opcionesAuth: AuthOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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

// CORRECCIÓN: Funciones de autenticación mejoradas
export const serviciosAuth = {
  verificarAutenticacion: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const persona = localStorage.getItem('persona_data');
      
      // Debe tener ambos: token y datos de persona
      return !!(token && persona);
    }
    return false;
  },

  obtenerToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  // NUEVO: Función para limpiar sesión completamente
  limpiarSesion: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');
      
      // Eliminar cookie
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      // Disparar evento de logout
      window.dispatchEvent(new Event('logout'));
    }
  },

  cerrarSesion: (): void => {
    serviciosAuth.limpiarSesion();
    
    if (typeof window !== 'undefined') {
      // Usar replace en lugar de href para evitar historial
      window.location.replace('/login');
    }
  },

  establecerToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      
      // También establecer cookie
      document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
    }
  },
};
