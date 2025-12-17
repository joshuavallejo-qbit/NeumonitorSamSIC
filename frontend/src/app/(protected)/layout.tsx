// frontend/src/app/(protected)/layout.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, CssBaseline, CircularProgress, Alert, Button } from '@mui/material';
import BarraNavegacion from '@/components/interfaz/BarraNavegacion';
import { servidorApi } from '@/lib/api';

export default function LayoutProtegido({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.log('No hay token en localStorage');
          router.replace('/login');
          return;
        }
        
        console.log('Token encontrado, verificando sesión...');
        
        // Opcional: Verificar con el servidor
        const respuesta = await servidorApi.verificarSesion();
        
        if (!respuesta.exito) {
          console.log('Sesión no válida en servidor');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('persona_data');
          router.replace('/login');
          return;
        }
        
        console.log('Sesión verificada correctamente');
        setVerificando(false);
        
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setError('Error verificando autenticación');
        setVerificando(false);
      }
    };
    
    verificarAutenticacion();
  }, [router]);
  
  if (verificando) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <p>Verificando autenticación...</p>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/login')}
        >
          Ir a Login
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>
      <CssBaseline />
    </Box>
  );

}
