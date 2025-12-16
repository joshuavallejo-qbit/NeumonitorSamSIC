// frontend/src/app/(auth)/registro/page.tsx

'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { servidorApi } from '@/lib/api';

interface FormularioRegistro {
  nombre_completo: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
  direccion?: string;
}

export default function PaginaRegistro() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
const [mostrarPassword, setMostrarPassword] = useState(false);
const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

const toggleMostrarPassword = () => setMostrarPassword(!mostrarPassword);
const toggleMostrarConfirmPassword = () => setMostrarConfirmPassword(!mostrarConfirmPassword);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormularioRegistro>();

  const password = watch('password');

  const enviarRegistro = async (datos: FormularioRegistro) => {
    setCargando(true);
    setError(null);

    try {
      const datosRegistro = {
        email: datos.email,
        password: datos.password,
        nombre_completo: datos.nombre_completo,
        telefono: datos.telefono || '',
        direccion: datos.direccion || ''
      };

      const respuesta = await servidorApi.registro(datosRegistro);
      
      if (respuesta.exito) {
        alert('Registro exitoso. Ahora inicia sesión.');
        router.push('/login'); 
      } else {
        setError(respuesta.mensaje || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Crear Cuenta
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Regístrate para acceder al sistema de detección de neumonía
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(enviarRegistro)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre Completo"
                {...register('nombre_completo', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 3,
                    message: 'Mínimo 3 caracteres',
                  },
                })}
                error={!!errors.nombre_completo}
                helperText={errors.nombre_completo?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
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
              />
            </Grid>
<Grid size={{ xs: 12, sm: 6 }}>
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
</Grid>

<Grid size={{ xs: 12, sm: 6 }}>
  <TextField
    fullWidth
    label="Confirmar Contraseña"
    type={mostrarConfirmPassword ? 'text' : 'password'}
    {...register('confirmarPassword', {
      required: 'Confirma tu contraseña',
      validate: (value) =>
        value === password || 'Las contraseñas no coinciden',
    })}
    error={!!errors.confirmarPassword}
    helperText={errors.confirmarPassword?.message}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={toggleMostrarConfirmPassword} edge="end">
            {mostrarConfirmPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
</Grid>


            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                {...register('telefono')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Dirección"
                {...register('direccion')}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={cargando}
            sx={{ mt: 4, py: 1.5 }}
          >
            {cargando ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Registrarse'
            )}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
            ¿Ya tienes cuenta?{' '}
            <Button
              variant="text"
              size="small"
              onClick={() => router.push('/login')}
            >
              Inicia sesión aquí
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}