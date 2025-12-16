// src/types/tipos.ts

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'usuario' | 'admin';
}

export interface Prediccion {
  id: string;
  usuarioId: string;
  imagenUrl: string;
  diagnostico: 'NORMAL' | 'NEUMONIA';
  confianza: number;
  fecha: Date;
  probabilidades: {
    normal: number;
    neumonia: number;
  };
}

export interface FormularioAnalisis {
  imagen: File | null;
  comentarios?: string;
}

export interface RespuestaApi {
  exito: boolean;
  mensaje?: string;
  datos?: any;
}

export interface EstadoAutenticacion {
  usuario: Usuario | null;
  cargando: boolean;
  estaAutenticado: boolean;
}
export interface Analisis {
  id: string;
  imagen_url: string;
  diagnostico: 'NORMAL' | 'NEUMONIA';
  confianza: number;
  fecha: string;
  comentarios?: string;
  probabilidades: {
    normal: number;
    neumonia: number;
  };
}
export interface HistorialResponse {
  success: boolean;
  data?: Analisis[];
}