// frontend/src/app/(auth)/login/page.tsx - CORREGIDO
'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Login as LoginIcon, LockReset } from '@mui/icons-material';
import { servidorApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ModalRecuperarPassword from '@/components/ModalRecuperarPassword'; // Asegúrate de crear este componente
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);
  const router = useRouter();
const [mostrarPassword, setMostrarPassword] = useState(false);
const toggleMostrarPassword = () => {
  setMostrarPassword((prev) => !prev);
};

  useEffect(() => {
    // Redirigir si ya está autenticado
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const manejarSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const respuesta = await servidorApi.login(email, password);
      
      if (respuesta.exito) {
        // Disparar evento de login para que useAuth se actualice
        window.dispatchEvent(new Event('login'));
        
        // Redirigir a dashboard
        router.push('/dashboard');
      } else {
        setError(respuesta.mensaje || 'Error en el inicio de sesión');
        setCargando(false);
      }
    } catch (err: any) {
      setError('Error de conexión con el servidor');
      setCargando(false);
    }
  };

  const abrirModalRecuperar = () => {
    setModalRecuperarAbierto(true);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <LoginIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Iniciar Sesión
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Accede a tu cuenta para analizar radiografías y ver tu historial
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={manejarSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={cargando}
          />
<TextField
  label="Contraseña"
  type={mostrarPassword ? 'text' : 'password'}
  fullWidth
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  margin="normal"
  disabled={cargando}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={toggleMostrarPassword}
          edge="end"
          aria-label="mostrar u ocultar contraseña"
        >
          {mostrarPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

          <Box sx={{ mt: 2, mb: 3, textAlign: 'right' }}>
            <Button
              type="button"
              onClick={abrirModalRecuperar}
              startIcon={<LockReset />}
              disabled={cargando}
              size="small"
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={cargando}
            startIcon={cargando ? <CircularProgress size={20} /> : <LoginIcon />}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" underline="hover" fontWeight="medium">
              Regístrate aquí
            </Link>
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 4 }}>

                <Grid size={{ xs: 12}}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Nota sobre seguridad:</strong> Usamos cifrado SHA-256 para proteger tu contraseña. 
                Para recuperar contraseña, solo necesitas tu email y establecer una nueva contraseña.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* Modal de recuperación de contraseña */}
      <ModalRecuperarPassword
        abierto={modalRecuperarAbierto}
        onCerrar={() => setModalRecuperarAbierto(false)}
      />
    </Container>
  );
}