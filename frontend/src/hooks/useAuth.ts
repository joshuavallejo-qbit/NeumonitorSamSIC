// frontend/src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { servidorApi } from '@/lib/api';
import { config } from '@/lib/config';
export const useAuth = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const verificarAutenticacion = async () => {
      setCargando(true);
      
      // Primero verificar token local
      const token = localStorage.getItem(config.auth.tokenKey);
      const usuarioData = localStorage.getItem(config.auth.userKey);
      
      if (token && usuarioData) {
        try {
          // Intentar verificar con el servidor
          const respuesta = await servidorApi.verificarSesion();
          
          if (respuesta.exito) {
            setEstaAutenticado(true);
            setUsuario(JSON.parse(usuarioData));
          } else {
            // Token inválido, limpiar
            localStorage.removeItem(config.auth.tokenKey);
            localStorage.removeItem(config.auth.userKey);
            setEstaAutenticado(false);
            setUsuario(null);
          }
        } catch (error) {
          console.warn('Error verificando sesión:', error);
          // Si hay error de conexión, mantener sesión local
          setEstaAutenticado(true);
          setUsuario(JSON.parse(usuarioData));
        }
      } else {
        setEstaAutenticado(false);
        setUsuario(null);
      }
      
      setCargando(false);
    };

    verificarAutenticacion();
  }, []);

  return { estaAutenticado, cargando, usuario };
};
