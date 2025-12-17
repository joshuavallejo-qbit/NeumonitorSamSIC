'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close, LockReset } from '@mui/icons-material';
import { servidorApi } from '@/lib/api';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';

interface ModalRecuperarPasswordProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function ModalRecuperarPassword({
  abierto,
  onCerrar,
}: ModalRecuperarPasswordProps) {
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  const validarFormulario = () => {
    if (!email || !nuevaPassword || !confirmarPassword) {
      setError('Todos los campos son obligatorios');
      return false;
    }
    
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    // Validar formato email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email no válido');
      return false;
    }
    
    return true;
  };

  const manejarEnviar = async () => {
    if (!validarFormulario()) return;
    
    setCargando(true);
    setError(null);
    setExito(null);
    
    try {
      const respuesta = await servidorApi.recuperarPassword(
        email,
        nuevaPassword,
        confirmarPassword
      );
      
      if (respuesta.exito) {
        setExito('¡Contraseña actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.');
        
        // Limpiar formulario después de 2 segundos
        setTimeout(() => {
          setEmail('');
          setNuevaPassword('');
          setConfirmarPassword('');
          setCargando(false);
        }, 2000);
      } else {
        setError(respuesta.mensaje || 'Error al recuperar contraseña');
        setCargando(false);
      }
    } catch (err: any) {
      setError('Error de conexión con el servidor');
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setEmail('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setError(null);
    setExito(null);
  };

  const manejarCerrar = () => {
    limpiarFormulario();
    onCerrar();
  };

  return (
    <Dialog 
      open={abierto} 
      onClose={manejarCerrar}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockReset color="primary" />
          <Typography variant="h6">Recuperar Contraseña</Typography>
        </Box>
        <IconButton
          aria-label="cerrar"
          onClick={manejarCerrar}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresa tu email y una nueva contraseña. No se enviará ningún email de confirmación.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {exito && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {exito}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando || !!exito}
            fullWidth
            required
            helperText="Ingresa el email con el que te registraste"
          />
          <TextField
  label="Nueva Contraseña"
  type={mostrarNuevaPassword ? 'text' : 'password'}
  value={nuevaPassword}
  onChange={(e) => setNuevaPassword(e.target.value)}
  disabled={cargando || !!exito}
  fullWidth
  required
  helperText="Mínimo 8 caracteres"
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
          edge="end"
        >
          {mostrarNuevaPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

         <TextField
  label="Confirmar Nueva Contraseña"
  type={mostrarConfirmarPassword ? 'text' : 'password'}
  value={confirmarPassword}
  onChange={(e) => setConfirmarPassword(e.target.value)}
  disabled={cargando || !!exito}
  fullWidth
  required
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
          edge="end"
        >
          {mostrarConfirmarPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={manejarCerrar} 
          disabled={cargando}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={manejarEnviar}
          disabled={cargando || !!exito}
          startIcon={cargando ? <CircularProgress size={20} /> : <LockReset />}
        >
          {cargando ? 'Procesando...' : 'Recuperar Contraseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}