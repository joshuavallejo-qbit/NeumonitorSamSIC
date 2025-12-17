//frontend/src/lib/almacen.ts
// Funciones auxiliares para almacenamiento
import { Prediccion } from '@/types/tipos';

export const utilidadesAlmacen = {
  // Guardar predicción en localStorage (backup)
  guardarPrediccionLocal: (prediccion: Prediccion): void => {
    if (typeof window !== 'undefined') {
      const prediccionesExistentes = utilidadesAlmacen.obtenerPrediccionesLocal();
      prediccionesExistentes.unshift(prediccion);
      localStorage.setItem('predicciones_backup', JSON.stringify(prediccionesExistentes));
    }
  },

  // Obtener predicciones de localStorage
  obtenerPrediccionesLocal: (): Prediccion[] => {
    if (typeof window !== 'undefined') {
      const datos = localStorage.getItem('predicciones_backup');
      if (datos) {
        try {
          return JSON.parse(datos);
        } catch (error) {
          console.error('Error parseando predicciones:', error);
        }
      }
    }
    return [];
  },

  // Limpiar predicciones de localStorage
  limpiarPrediccionesLocal: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('predicciones_backup');
    }
  },

  // Guardar configuración de usuario
  guardarConfiguracion: (config: {
    temaOscuro: boolean;
    notificaciones: boolean;
    idioma: string;
  }): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('configuracion_usuario', JSON.stringify(config));
    }
  },

  // Obtener configuración de usuario
  obtenerConfiguracion: () => {
    if (typeof window !== 'undefined') {
      const datos = localStorage.getItem('configuracion_usuario');
      if (datos) {
        try {
          return JSON.parse(datos);
        } catch (error) {
          console.error('Error parseando configuración:', error);
        }
      }
    }
    return {
      temaOscuro: false,
      notificaciones: true,
      idioma: 'es',
    };
  },
};