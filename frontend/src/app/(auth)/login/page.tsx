// frontend/src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { servidorApi } from '@/lib/api';
import { serviciosAuth } from '@/lib/auth';

interface FormularioLogin {
  email: string;
  password: string;
}

export default function PaginaLogin() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [verificandoSesion, setVerificandoSesion] = useState(true);
const [mostrarPassword, setMostrarPassword] = useState(false);
const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

const toggleMostrarPassword = () => setMostrarPassword(!mostrarPassword);
const toggleMostrarConfirmPassword = () => setMostrarConfirmPassword(!mostrarConfirmPassword);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioLogin>();

  const enviarLogin = async (datos: FormularioLogin) => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await servidorApi.login(datos.email, datos.password);
      if (respuesta.exito && respuesta.datos) {
  const datosApi = respuesta.datos.data; // según tu backend
  const token = datosApi.token;
  const usuario = datosApi.persona;

  if (token && usuario) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('persona_data', JSON.stringify(usuario));

    // Disparar evento para actualizar la barra de navegación
    window.dispatchEvent(new Event('login'));

    router.push('/dashboard');
  } else {
    setError('Respuesta inválida del servidor');
  }
} else {
  setError(respuesta.mensaje || 'Error al iniciar sesión');
}

    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (serviciosAuth.verificarAutenticacion()) {
      router.replace('/dashboard'); // Redirige si ya hay sesión
    } else {
      setVerificandoSesion(false); // Mostrar login
    }
  }, [router]);

  if (verificandoSesion) return <div>Cargando...</div>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Iniciar Sesión
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Accede al sistema de detección de neumonía
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(enviarLogin)}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            {...register('email', {
              required: 'El correo es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Correo inválido',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            margin="normal"
          />

  <TextField
    fullWidth
    label="Contraseña"
    type={mostrarPassword ? 'text' : 'password'}
    {...register('password', {
      required: 'La contraseña es requerida',
      minLength: {
        value: 6,
        message: 'Mínimo 6 caracteres',
      },
    })}
    error={!!errors.password}
    helperText={errors.password?.message}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={toggleMostrarPassword} edge="end">
            {mostrarPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={cargando}
            sx={{ mt: 3, py: 1.5 }}
          >
            {cargando ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            ¿No tienes cuenta?{' '}
            <Button
              variant="text"
              size="small"
              onClick={() => router.push('/registro')}
            >
              Regístrate aquí
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}