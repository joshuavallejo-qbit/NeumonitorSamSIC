// app/ClienteThemeProvider.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { usoAlmacenInterfaz } from '@/store/usoAlmacen';
import { crearTema } from '@/styles/tema';

export default function ClienteThemeProvider({ children }: { children: ReactNode }) {
  const [montado, setMontado] = useState(false);
  const { temaOscuro } = usoAlmacenInterfaz();
  const tema = crearTema(temaOscuro);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) return <div>Cargando...</div>;

  return <ThemeProvider theme={tema}>{children}</ThemeProvider>;
}
