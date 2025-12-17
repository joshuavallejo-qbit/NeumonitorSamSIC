// frontend/src/app/layout.tsx - .
import { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import ClienteThemeProvider from '@/app/ClienteThemeProvider';
import BarraNavegacion from '@/components/interfaz/BarraNavegacion';
export const metadata = {
  title: 'Neumonitor - Sistema de Detección de Neumonía',
  description: 'Sistema de análisis de radiografías para detección de neumonía',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
<ClienteThemeProvider> <BarraNavegacion /> {children} </ClienteThemeProvider> <CssBaseline />
      </body>
    </html>
  );
}
