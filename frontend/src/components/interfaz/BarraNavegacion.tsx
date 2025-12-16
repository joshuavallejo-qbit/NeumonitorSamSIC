//frontend/src/components/interfaz/BarraNavegacion
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Backdrop,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assessment,
  History,
  Group,
  Brightness4,
  Brightness7,
  Logout,
  Person,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { usoAlmacenInterfaz } from '@/store/usoAlmacen';
import { servidorApi } from '@/lib/api';

const enlacesBase = [
  { texto: 'Análisis', icono: <Assessment />, ruta: '/analisis' },
  { texto: 'Equipo', icono: <Group />, ruta: '/equipo' },
];

const enlaceHistorial = { texto: 'Historial', icono: <History />, ruta: '/historial' };
const enlaceDashboard =   { texto: 'Dashboard', icono: <Dashboard />, ruta: '/dashboard' };

export default function BarraNavegacion() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [personaData, setPersonaData] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const rutaActual = usePathname();
  const tema = useTheme();
  const { alternarTema } = usoAlmacenInterfaz();

useEffect(() => {
  // Verificar al montar
  verificarAutenticacion();

  const onStorage = (e: StorageEvent) => {
    if (e.key === 'auth_token' || e.key === 'persona_data') {
      verificarAutenticacion();
    }
  };

  // Escuchar eventos de login/logout
  const onLogin = () => verificarAutenticacion();

  window.addEventListener('storage', onStorage);
  window.addEventListener('login', onLogin);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('login', onLogin);
  };
}, []);


  useEffect(() => {
    // Ocultar el loading cuando cambie la ruta
    setCargando(false);
  }, [rutaActual]);

  const verificarAutenticacion = () => {
    const token = localStorage.getItem('auth_token');
    const persona = localStorage.getItem('persona_data');

    if (token && persona) {
      setUsuarioAutenticado(true);
      try {
        setPersonaData(JSON.parse(persona));
      } catch {
        setPersonaData(null);
      }
    } else {
      setUsuarioAutenticado(false);
      setPersonaData(null);
    }
  };

  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const navegar = (ruta: string) => {
    // Bloquear acceso a /historial si no está autenticado
    if (ruta === '/historial' && !usuarioAutenticado) {
      setMenuAbierto(false);
      // opcional: podrías mostrar un snackbar indicando que inicie sesión; aquí redirigimos a login
      router.push('/login');
      return;
    }

    // Si ya estamos en la misma página, no hacer nada
    if (rutaActual === ruta) {
      setMenuAbierto(false);
      return;
    }

    // Mostrar loading brevemente
    setCargando(true);
    setMenuAbierto(false);
    
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Configurar timeout para ocultar loading automáticamente después de 1.5 segundos
    timeoutRef.current = setTimeout(() => {
      setCargando(false);
    }, 1500);

    // Navegar a la ruta
    router.push(ruta);
  };

  const manejarLogout = async () => {
    setCargando(true);
    try {
      await servidorApi.logout();
      // limpiar localStorage si corresponde
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');

      setUsuarioAutenticado(false);
      setPersonaData(null);
      setAnchorEl(null);
      setMenuAbierto(false);
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirMenuUsuario = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const cerrarMenuUsuario = () => {
    setAnchorEl(null);
  };

  // Construir lista de enlaces visibles (añadir historial solo si está autenticado)
  const enlacesVisibles = usuarioAutenticado
    ? [...enlacesBase, enlaceHistorial, enlaceDashboard]
    : enlacesBase;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={alternarMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Neumonitor
          </Typography>

          <IconButton onClick={alternarTema} color="inherit">
            {tema.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {usuarioAutenticado ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {personaData?.nombre_completo || 'Usuario'}
                </Typography>
                <IconButton onClick={abrirMenuUsuario} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {personaData?.nombre_completo?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Box>

              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={cerrarMenuUsuario}>
               

                <MenuItem onClick={manejarLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navegar('/login')} sx={{ mr: 1 }}>
                Iniciar Sesión
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => navegar('/registro')}>
                Registrarse
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={menuAbierto} onClose={alternarMenu}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {enlacesVisibles.map((enlace) => (
              <ListItem key={enlace.texto} disablePadding>
                <ListItemButton
                  selected={rutaActual === enlace.ruta}
                  onClick={() => navegar(enlace.ruta)}
                >
                  <ListItemIcon>{enlace.icono}</ListItemIcon>
                  <ListItemText primary={enlace.texto} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Backdrop 
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'opacity 200ms ease-in-out',
          opacity: cargando ? 1 : 0,
          pointerEvents: cargando ? 'auto' : 'none',
        }} 
        open={cargando}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
