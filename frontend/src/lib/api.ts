// frontend/src/lib/api.ts
import axios from 'axios';
import { RespuestaApi } from '@/types/tipos';

const clienteApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,
});

clienteApi.defaults.headers.common['Content-Type'] = 'application/json';
clienteApi.defaults.headers.common['Accept'] = 'application/json';

// Variable para evitar múltiples redirecciones simultáneas
let isRedirecting = false;
let redirectTimeout: NodeJS.Timeout | null = null;

// Interceptor para agregar token
clienteApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores - . PARA EVITAR BUCLES
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // NO hacer nada si ya estamos en login/registro
      if (currentPath.includes('/login') || currentPath.includes('/registro')) {
        return Promise.reject(error);
      }
      
      // Solo procesar si no estamos ya redirigiendo
      if (!isRedirecting) {
        isRedirecting = true;
        
        console.log('🚫 Error 401: Sesión inválida');
        
        // Limpiar datos de sesión INMEDIATAMENTE
        localStorage.removeItem('auth_token');
        localStorage.removeItem('persona_data');
        document.cookie = 'auth_token=; path=/; max-age=0';
        
        // Disparar evento de logout
        window.dispatchEvent(new Event('logout'));
        
        // Redirigir después de un pequeño delay para evitar race conditions
        if (redirectTimeout) clearTimeout(redirectTimeout);
        redirectTimeout = setTimeout(() => {
          window.location.replace('/login');
          isRedirecting = false;
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

const manejarErrorApi = (error: any): RespuestaApi => {
  console.error('Error API:', error);
  
  if (error.response) {
    return {
      exito: false,
      mensaje: error.response.data?.detail || `Error ${error.response.status}`,
    };
  } else if (error.request) {
    return {
      exito: false,
      mensaje: 'Error de conexión con el servidor',
    };
  } else {
    return {
      exito: false,
      mensaje: error.message || 'Error desconocido',
    };
  }
};

export const servidorApi = {
  login: async (email: string, password: string): Promise<RespuestaApi> => {
    try {
      // Resetear bandera de redirección antes de login
      isRedirecting = false;
      
      const respuesta = await clienteApi.post('/auth/login', { email, password });
      
      if (respuesta.data.success && respuesta.data.data?.token) {
        const token = respuesta.data.data.token;
        const persona = respuesta.data.data.persona;
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('persona_data', JSON.stringify(persona));
        
        // Guardar en cookies
        document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
        
        console.log('✅ Sesión establecida correctamente');
        
        return { 
          exito: true, 
          datos: respuesta.data,
          mensaje: respuesta.data.message
        };
      }
      
      return {
        exito: false,
        mensaje: 'Respuesta inválida del servidor'
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  registro: async (datos: {
    email: string, 
    password: string, 
    nombre_completo: string, 
    telefono?: string, 
    direccion?: string
  }): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.post('/auth/registro', datos);
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  logout: async (): Promise<RespuestaApi> => {
    try {
      // Resetear bandera
      isRedirecting = false;
      
      await clienteApi.post('/auth/logout');
      
      // Limpiar todo
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      console.log('✅ Sesión cerrada correctamente');
      
      return { exito: true };
    } catch (error: any) {
      // Incluso si falla el logout en el servidor, limpiar localmente
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      return { exito: true };
    }
  },

  predecir: async (archivoImagen: File): Promise<RespuestaApi> => {
    try {
      const formData = new FormData();
      formData.append('imagen', archivoImagen);
      
      const respuesta = await clienteApi.post('/predecir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  subirAnalisis: async (archivoImagen: File, comentarios?: string): Promise<RespuestaApi> => {
    try {
      const formData = new FormData();
      formData.append('imagen', archivoImagen);
      if (comentarios) {
        formData.append('comentarios', comentarios);
      }
      
      const respuesta = await clienteApi.post('/analisis/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  obtenerHistorial: async (): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.get('/analisis/historial');
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  salud: async (): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.get('/salud');
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.message || 'Error conectando con el servidor',
      };
    }
  },

  obtenerPerfil: async (): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.get('/persona/perfil');
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  verificarSesion: async (): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.get('/auth/verificar-sesion');
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },
  calcularVulnerabilidad: async (personaId: string): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.get(`/vulnerabilidad/${personaId}`);
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  obtenerPerfilSalud: async (): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.get('/analisis/perfil-salud');
      return { 
        exito: true, 
        datos: respuesta.data 
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },
  recuperarPassword: async (email: string, nuevaPassword: string, confirmarPassword: string): Promise<RespuestaApi> => {
  try {
    const respuesta = await clienteApi.post('/auth/recuperar-password', {
      email,
      nueva_password: nuevaPassword,
      confirmar_password: confirmarPassword
    });
    return { 
      exito: true, 
      datos: respuesta.data 
    };
  } catch (error: any) {
    return manejarErrorApi(error);
  }
},
};
