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

// Interceptor para manejar errores
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/registro')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('persona_data');
        window.location.href = '/login';
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
  // CORRECCIÓN PRINCIPAL: Login mejorado
  login: async (email: string, password: string): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.post('/auth/login', { email, password });
      
      // Verificar estructura de respuesta
      if (respuesta.data.success && respuesta.data.data?.token) {
        const token = respuesta.data.data.token;
        const persona = respuesta.data.data.persona;
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('persona_data', JSON.stringify(persona));
        
        // NUEVO: Guardar en cookies para el middleware
        document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
        
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
      await clienteApi.post('/auth/logout');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');
      
      // NUEVO: Eliminar cookie
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      return { exito: true };
    } catch (error: any) {
      return manejarErrorApi(error);
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
  }
};
