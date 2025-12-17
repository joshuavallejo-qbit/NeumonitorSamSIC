// src/types/tipos.ts
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'usuario' | 'admin';
}
export interface RecuperarPasswordRequest {
  email: string;
  nueva_password: string;
  confirmar_password: string;
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
  // Nuevos campos
  nivel_vulnerabilidad_paciente?: string;
  prioridad_atencion_sugerida?: string;
  explicacion_vulnerabilidad?: string;
  detalles_analisis?: string;
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
  nivel_vulnerabilidad_paciente?: string;
  prioridad_atencion_sugerida?: string;
  explicacion_vulnerabilidad?: string;
  detalles_analisis?: string;
}

export interface HistorialResponse {
  success: boolean;
  data?: Analisis[];
}

//  interfaces para el perfil de salud
export interface PerfilSalud {
  id: string;
  persona_id: string;
  fecha_nacimiento: string;
  tipo_zona: 'urbana' | 'periurbana' | 'rural' | 'comunidad_dificil';
  situacion_economica: 'ingresos_limites' | 'ingresos_moderados' | 'ingresos_estables' | 'prefiero_no_responder';
  acceso_salud: 'muy_dificil' | 'dificil' | 'acceso_moderado' | 'facil_acceso' | 'atencion_privada';
  experiencias_covid: {
    diagnosticado: boolean;
    hospitalizado: boolean;
    secuelas_respiratorias: boolean;
    perdida_empleo: boolean;
    sin_covid: boolean;
  };
  nivel_vulnerabilidad: 'BAJA' | 'MEDIA' | 'ALTA';
  prioridad_atencion: 'BAJA' | 'MEDIA' | 'ALTA';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface RegistroRequest {
  email: string;
  password: string;
  nombre_completo: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento: string;
  tipo_zona: 'urbana' | 'periurbana' | 'rural' | 'comunidad_dificil';
  situacion_economica: 'ingresos_limites' | 'ingresos_moderados' | 'ingresos_estables' | 'prefiero_no_responder';
  acceso_salud: 'muy_dificil' | 'dificil' | 'acceso_moderado' | 'facil_acceso' | 'atencion_privada';
  experiencias_covid: {
    diagnosticado: boolean;
    hospitalizado: boolean;
    secuelas_respiratorias: boolean;
    perdida_empleo: boolean;
    sin_covid: boolean;
  };
}

export interface VulnerabilidadInfo {
  nivel_vulnerabilidad: string;
  prioridad_atencion: string;
  factores_criticos: number;
  motivos: string[];
  edad_actual?: number;
}