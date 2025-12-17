// frontend/src/lib/api.ts - .
import axios from 'axios';
import { RespuestaApi } from '@/types/tipos';

const clienteApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,  // Permite enviar cookies/tokens
});
// Configuración específica para el interceptor
clienteApi.defaults.headers.common['Content-Type'] = 'application/json';
clienteApi.defaults.headers.common['Accept'] = 'application/json';
// Interceptor para agregar token a las solicitudes
clienteApi.interceptors.request.use(
  (config) => {
    // Solo agregar token si estamos en el cliente
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

// Interceptor para manejar errores de autenticación
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir si no está en login/registro
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

// Función para manejar errores de API
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
  // Autenticación
  login: async (email: string, password: string): Promise<RespuestaApi> => {
    try {
      const respuesta = await clienteApi.post('/auth/login', { email, password });
      
      if (respuesta.data.success && respuesta.data.data?.token) {
        localStorage.setItem('auth_token', respuesta.data.data.token);
        localStorage.setItem('persona_data', JSON.stringify(respuesta.data.data.persona));
      }
      return { 
        exito: true, 
        datos: respuesta.data,
        mensaje: respuesta.data.message
      };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  registro: async (datos: {email: string, password: string, nombre_completo: string, telefono?: string, direccion?: string}): Promise<RespuestaApi> => {
try {
    const respuesta = await clienteApi.post('/auth/registro', datos);
    // No guardar token aquí
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
      return { exito: true };
    } catch (error: any) {
      return manejarErrorApi(error);
    }
  },

  // Análisis público (sin autenticación)
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

  // Análisis protegido (con autenticación)
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

  // Obtener historial de análisis
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

  // Verificar salud del sistema
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

  // Obtener perfil de persona
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

  // Verificar sesión
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
