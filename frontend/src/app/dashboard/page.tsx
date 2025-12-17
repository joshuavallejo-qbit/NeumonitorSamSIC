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
  LinearProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  MedicalServices,
  History,
  CloudUpload,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Person,
  LocationOn,
  AttachMoney,
  HealthAndSafety,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { servidorApi } from '@/lib/api';

interface EstadisticasPersonales {
  totalAnalisis: number;
  normales: number;
  neumonia: number;
  confianzaPromedio: string;
  ultimoAnalisis?: any;
  vulnerabilidad?: {
    nivel_vulnerabilidad: string;
    prioridad_atencion: string;
    factores_criticos: number;
    motivos: string[];
  };
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
  const [perfilSalud, setPerfilSalud] = useState<any>(null);
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
      
      if (historialRespuesta.exito && historialRespuesta.datos) {
        const analisis = Array.isArray(historialRespuesta.datos) 
          ? historialRespuesta.datos 
          : historialRespuesta.datos.data || [];
        
        // Calcular estadísticas CORRECTAMENTE
        const normales = analisis.filter((a: any) => 
          a.diagnostico === 'NORMAL' || a.diagnostico === 'Normal'
        ).length;
        
        const neumonia = analisis.filter((a: any) => 
          a.diagnostico === 'NEUMONIA' || a.diagnostico === 'PNEUMONIA' || a.diagnostico === 'Neumonia'
        ).length;
        
        const totalAnalisis = analisis.length;
        
        // Calcular confianza promedio solo de los que tienen confianza
        const analisisConConfianza = analisis.filter((a: any) => a.confianza);
        const confianzaPromedio = analisisConConfianza.length > 0
          ? (analisisConConfianza.reduce((acc: number, a: any) => acc + a.confianza, 0) / analisisConConfianza.length).toFixed(1)
          : '0';
        
        const nuevasEstadisticas: EstadisticasPersonales = {
          totalAnalisis,
          normales,
          neumonia,
          confianzaPromedio,
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
      
      // Obtener perfil de salud
try {
  const perfilRespuesta = await servidorApi.obtenerPerfilSalud();
  if (perfilRespuesta.exito && perfilRespuesta.datos) {
    // El perfil puede estar en diferentes lugares de la respuesta
    const perfilData = perfilRespuesta.datos.data || perfilRespuesta.datos;
    setPerfilSalud(perfilData);
  }
} catch (perfilError) {
  console.log('No se pudo cargar el perfil de salud:', perfilError);
  // No es un error crítico, continuar sin perfil
}
      
    } catch (err: any) {
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

  const obtenerColorVulnerabilidad = (nivel: string) => {
    switch (nivel) {
      case 'ALTA': return 'error';
      case 'MEDIA': return 'warning';
      case 'BAJA': return 'success';
      default: return 'default';
    }
  };

  const formatearFecha = (fechaString: string) => {
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
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
<Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalServices color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Estado del Sistema</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conexión con el servidor de IA
                  </Typography>
                </Box>
              </Box>
            </Grid>
    <Grid size={{ xs: 12, md: 6 }}
sx={{ textAlign: 'right' }}>
              {estadoServidor === null ? (
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
       <Grid size={{ xs: 12, sm:6 ,md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total de Análisis
              </Typography>
              <Typography variant="h4">{estadisticas.totalAnalisis}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm:6, md: 3}}>

          <Card>
            <CardContent>
              <Typography color="success.main" gutterBottom>
                Radiografías Normales
              </Typography>
              <Typography variant="h4">{estadisticas.normales}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3, sm:6 }}>
        
          <Card>
            <CardContent>
              <Typography color="error.main" gutterBottom>
                Posibles Neumonías
              </Typography>
              <Typography variant="h4">{estadisticas.neumonia}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 ,sm:6}}>

          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Confianza Promedio
              </Typography>
              <Typography variant="h4">{estadisticas.confianzaPromedio}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acciones rápidas y último análisis */}
      <Grid container spacing={3}>
<Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
<Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ py: 2 }}
                    onClick={() => router.push('/analisis-personalizado')}
                    disabled={cargando}
                  >
                    Nuevo Análisis
                  </Button>
                </Grid>
<Grid size={{ xs: 12}}>
                  <Button
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

<Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Último Análisis
              </Typography>
              {cargando ? (
                <LinearProgress sx={{ my: 2 }} />
              ) : estadisticas.ultimoAnalisis ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={estadisticas.ultimoAnalisis.diagnostico}
                      color={estadisticas.ultimoAnalisis.diagnostico === 'NORMAL' ? 'success' : 'error'}
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Confianza: {estadisticas.ultimoAnalisis.confianza?.toFixed(1) || '0'}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {formatearFecha(estadisticas.ultimoAnalisis.fecha)}
                  </Typography>
                  
                  {estadisticas.ultimoAnalisis.nivel_vulnerabilidad_paciente && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Vulnerabilidad: {estadisticas.ultimoAnalisis.nivel_vulnerabilidad_paciente}
                      </Typography>
                    </Box>
                  )}
                  
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