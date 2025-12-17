// frontend/src/components/interfaz/BarraNavegacion.tsx 
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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
  MedicalServices,
  Menu as MenuIcon,
  Dashboard,
  Assessment,
  History,
  Group,
  Brightness4,
  Brightness7,
  Logout,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { usoAlmacenInterfaz } from '@/store/usoAlmacen';
import { servidorApi } from '@/lib/api';

const enlacesBase = [
  { texto: 'Equipo', icono: <Group />, ruta: '/equipo' },
];
const enlaceAnalisis={ texto: 'Análisis', icono: <Assessment />, ruta: '/analisis' };
const enlaceHistorial = { texto: 'Historial', icono: <History />, ruta: '/historial' };
const enlaceDashboard = { texto: 'Dashboard', icono: <Dashboard />, ruta: '/dashboard' };

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
    verificarAutenticacion();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'persona_data') {
        verificarAutenticacion();
      }
    };

    const onLogin = () => verificarAutenticacion();
    const onLogout = () => {
      setUsuarioAutenticado(false);
      setPersonaData(null);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('login', onLogin);
    window.addEventListener('logout', onLogout);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('login', onLogin);
      window.removeEventListener('logout', onLogout);
    };
  }, []);

  useEffect(() => {
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
    if (ruta === '/analisis' && usuarioAutenticado) {
    setMenuAbierto(false);
    router.push('/dashboard');
    return;
  }
    if (ruta === '/historial' && !usuarioAutenticado) {
      setMenuAbierto(false);
      router.push('/login');
      return;
    }

    if (rutaActual === ruta) {
      setMenuAbierto(false);
      return;
    }

    setCargando(true);
    setMenuAbierto(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setCargando(false);
    }, 1500);

    router.push(ruta);
  };

  const manejarLogout = async () => {
    // Prevenir múltiples clicks
    if (cargando) return;
    
    setCargando(true);
    cerrarMenuUsuario();
    setMenuAbierto(false);
    
    try {
      console.log('🚪 Cerrando sesión...');
      
      // 1. Limpiar estado local PRIMERO
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      // 2. Actualizar estado React
      setUsuarioAutenticado(false);
      setPersonaData(null);
      
      // 3. Disparar evento
      window.dispatchEvent(new Event('logout'));
      
      // 4. Llamar al backend (sin esperar la respuesta)
      servidorApi.logout().catch(err => {
        console.warn('Error al notificar logout al servidor:', err);
      });
      
      console.log('✅ Sesión cerrada localmente, redirigiendo...');
      
      // 5. Esperar un momento antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 6. Forzar recarga completa a login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Error en logout:', error);
      
      // En caso de error, asegurar limpieza y redirigir igual
      localStorage.removeItem('auth_token');
      localStorage.removeItem('persona_data');
      document.cookie = 'auth_token=; path=/; max-age=0';
      
      window.location.href = '/login';
    }
  };

  const abrirMenuUsuario = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const cerrarMenuUsuario = () => {
    setAnchorEl(null);
  };

const enlacesVisibles = usuarioAutenticado
  ? [...enlacesBase, enlaceHistorial, enlaceDashboard]
  : [...enlacesBase, enlaceAnalisis];


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
                <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
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
              <Button
  component={Link}
  href="/analisis-personalizado"
  sx={{ color: 'white' }}
  startIcon={<MedicalServices />}
>
  Análisis Personalizado
</Button>
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
