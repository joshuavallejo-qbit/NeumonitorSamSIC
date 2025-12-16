// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { servidorApi } from '@/lib/api';

export const useAuth = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const personaData = localStorage.getItem('persona_data');

    if (token && personaData) {
      setUsuario(JSON.parse(personaData));
      setEstaAutenticado(true);
    } else {
      setUsuario(null);
      setEstaAutenticado(false);
    }
    setCargando(false);
  }, []);

  const login = async (email: string, password: string) => {
    const respuesta = await servidorApi.login(email, password);
    if (respuesta.exito) {
      setUsuario(JSON.parse(localStorage.getItem('persona_data')!));
      setEstaAutenticado(true);
      return { exito: true };
    }
    return { exito: false, error: respuesta.mensaje };
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('persona_data');
    setUsuario(null);
    setEstaAutenticado(false);
  };

  return { usuario, cargando, estaAutenticado, login, logout };
};
