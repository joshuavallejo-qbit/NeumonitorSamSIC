// frontend/src/app/(public)/layout.tsx
'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
export default function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}