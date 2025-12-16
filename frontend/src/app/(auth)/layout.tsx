// app/(auth)/layout.tsx
'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Box, Container, CssBaseline } from '@mui/material';

export default function LayoutAuth({ children }: { children: ReactNode }) {
  const { estaAutenticado, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && estaAutenticado) {
      router.replace('/dashboard');
    }
  }, [cargando, estaAutenticado, router]);

  if (cargando) return <div>Cargando...</div>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container component="main">{children}</Container>
      <CssBaseline />
    </Box>
  );
}
