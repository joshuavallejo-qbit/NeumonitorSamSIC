// frontend/src/app/dashboard/page.tsx - .
'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  MedicalServices,
  History,
  CloudUpload,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { servidorApi } from '@/lib/api';
interface EstadisticasPersonales {
  totalAnalisis: number;
  normales: number;
  neumonia: number;
  confianzaPromedio: string;
  ultimoAnalisis?: any;
}

export default function PaginaDashboard() {
  const router = useRouter();
  const [estadoServidor, setEstadoServidor] = useState<boolean | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPersonales>({
    totalAnalisis: 0,
    normales: 0,
    neumonia: 0,
    confianzaPromedio: '0',
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setCargando(true);
      
      // Verificar salud del servidor
      const saludRespuesta = await servidorApi.salud();
      setEstadoServidor(saludRespuesta.exito);
      
      // Obtener historial personal
      const historialRespuesta = await servidorApi.obtenerHistorial();
      
      if (historialRespuesta.exito && historialRespuesta.datos?.data) {
        const analisis = historialRespuesta.datos.data;
        
        const nuevasEstadisticas: EstadisticasPersonales = {
          totalAnalisis: analisis.length,
          normales: analisis.filter((a: any) => a.diagnostico === 'NORMAL').length,
          neumonia: analisis.filter((a: any) => a.diagnostico === 'NEUMONIA').length,
          confianzaPromedio: analisis.length > 0
            ? (analisis.reduce((acc: number, a: any) => acc + a.confianza, 0) / analisis.length).toFixed(1)
            : '0',
          ultimoAnalisis: analisis.length > 0 ? analisis[0] : null,
        };
        
        setEstadisticas(nuevasEstadisticas);
      } else {
        setEstadisticas({
          totalAnalisis: 0,
          normales: 0,
          neumonia: 0,
          confianzaPromedio: '0',
        });
      }
    } catch (err) {
      setError('Error cargando datos del dashboard');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const verificarSaludServidor = async () => {
    const respuesta = await servidorApi.salud();
    setEstadoServidor(respuesta.exito);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estado del sistema */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalServices color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Estado del Sistema</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conexión con el servidor de IA
                  </Typography>
                </Box>
              </Box>
            </Grid>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >              {estadoServidor === null ? (
                <LinearProgress sx={{ width: 100, display: 'inline-block' }} />
              ) : estadoServidor ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={verificarSaludServidor}
                >
                  Conectado
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Warning />}
                  onClick={verificarSaludServidor}
                >
                  Desconectado
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas personales */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Mis Estadísticas
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Análisis
              </Typography>
              <Typography variant="h4">{estadisticas.totalAnalisis}</Typography>
            </CardContent>
          </Card>
        </Grid>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >          <Card>
            <CardContent>
              <Typography color="success.main" gutterBottom>
                Radiografías Normales
              </Typography>
              <Typography variant="h4">{estadisticas.normales}</Typography>
            </CardContent>
          </Card>
        </Grid>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >          <Card>
            <CardContent>
              <Typography color="error.main" gutterBottom>
                Posibles Neumonías
              </Typography>
              <Typography variant="h4">{estadisticas.neumonia}</Typography>
            </CardContent>
          </Card>
        </Grid>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Confianza Promedio
              </Typography>
              <Typography variant="h4">{estadisticas.confianzaPromedio}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acciones rápidas */}
      <Grid container spacing={3}>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ py: 2 }}
                    onClick={() => router.push('/analisis')}
                    disabled={cargando}
                  >
                    Nuevo Análisis
                  </Button>
                </Grid>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    fullWidth
                    sx={{ py: 2 }}
                    onClick={() => router.push('/historial')}
                    disabled={cargando}
                  >
                    Ver Historial
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Último Análisis
              </Typography>
              {cargando ? (
                <LinearProgress sx={{ my: 2 }} />
              ) : estadisticas.ultimoAnalisis ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" fontWeight="medium">
                    Diagnóstico: {estadisticas.ultimoAnalisis.diagnostico}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confianza: {estadisticas.ultimoAnalisis.confianza}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {new Date(estadisticas.ultimoAnalisis.fecha).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No hay análisis recientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
