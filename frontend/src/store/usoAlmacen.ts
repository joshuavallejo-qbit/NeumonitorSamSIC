//frontend/src/store/usoAlmacen.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, Prediccion } from '@/types/tipos';

interface EstadoAnalisis {
  predicciones: Prediccion[];
  cargando: boolean;
  error: string | null;
  ultimaPrediccion: Prediccion | null;
  agregarPrediccion: (prediccion: Prediccion) => void;
  establecerCargando: (cargando: boolean) => void;
  establecerError: (error: string | null) => void;
  limpiarHistorial: () => void;
  establecerUltimaPrediccion: (prediccion: Prediccion | null) => void;
}

export const usoAlmacenAnalisis = create<EstadoAnalisis>()(
  persist(
    (set) => ({
      predicciones: [],
      cargando: false,
      error: null,
      ultimaPrediccion: null,
      agregarPrediccion: (prediccion) =>
        set((estado) => ({
          predicciones: [prediccion, ...estado.predicciones],
          ultimaPrediccion: prediccion,
        })),
      establecerCargando: (cargando) => set({ cargando }),
      establecerError: (error) => set({ error }),
      limpiarHistorial: () => set({ predicciones: [], ultimaPrediccion: null }),
      establecerUltimaPrediccion: (prediccion) => set({ ultimaPrediccion: prediccion }),
    }),
    {
      name: 'analisis-almacen',
    }
  )
);

interface EstadoInterfaz {
  temaOscuro: boolean;
  alternarTema: () => void;
  mostrarMenu: boolean;
  alternarMenu: () => void;
}

export const usoAlmacenInterfaz = create<EstadoInterfaz>()(
  persist(
    (set) => ({
      temaOscuro: false,
      mostrarMenu: false,
      alternarTema: () =>
        set((estado) => ({ temaOscuro: !estado.temaOscuro })),
      alternarMenu: () =>
        set((estado) => ({ mostrarMenu: !estado.mostrarMenu })),
    }),
    {
      name: 'interfaz-almacen',
    }
  )
);

// Estado para el servidor
interface EstadoServidor {
  conectado: boolean;
  verificando: boolean;
  establecerConectado: (conectado: boolean) => void;
  establecerVerificando: (verificando: boolean) => void;
}

export const usoAlmacenServidor = create<EstadoServidor>()(
  (set) => ({
    conectado: false,
    verificando: false,
    establecerConectado: (conectado) => set({ conectado }),
    establecerVerificando: (verificando) => set({ verificando }),
  })
);