// frontend/src/hooks/useAuth.ts 
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const verificarAutenticacion = () => {
      setCargando(true);
      
      try {
        // Verificar localmente - NO hacer llamadas al servidor
        const token = localStorage.getItem('auth_token');
        const usuarioData = localStorage.getItem('persona_data');
        
        // Validar que ambos existan y el token tenga formato UUID válido
        if (token && usuarioData) {
          // Validar formato UUID básico
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          if (uuidRegex.test(token)) {
            try {
              const parsedUser = JSON.parse(usuarioData);
              setEstaAutenticado(true);
              setUsuario(parsedUser);
            } catch (error) {
              console.error('Error parseando datos de usuario:', error);
              // Si hay error parseando, limpiar todo
              localStorage.removeItem('auth_token');
              localStorage.removeItem('persona_data');
              document.cookie = 'auth_token=; path=/; max-age=0';
              setEstaAutenticado(false);
              setUsuario(null);
            }
          } else {
            // Token inválido, limpiar
            console.warn('Token con formato inválido detectado');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('persona_data');
            document.cookie = 'auth_token=; path=/; max-age=0';
            setEstaAutenticado(false);
            setUsuario(null);
          }
        } else {
          setEstaAutenticado(false);
          setUsuario(null);
        }
      } catch (error) {
        console.error('Error en verificarAutenticacion:', error);
        setEstaAutenticado(false);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    verificarAutenticacion();

    // Escuchar eventos de login/logout
    const onLogin = () => {
      console.log('📢 Evento login recibido');
      verificarAutenticacion();
    };
    
    const onLogout = () => {
      console.log('📢 Evento logout recibido');
      setEstaAutenticado(false);
      setUsuario(null);
      setCargando(false);
    };

    window.addEventListener('login', onLogin);
    window.addEventListener('logout', onLogout);

    return () => {
      window.removeEventListener('login', onLogin);
      window.removeEventListener('logout', onLogout);
    };
  }, []);

  return { estaAutenticado, cargando, usuario };
};
