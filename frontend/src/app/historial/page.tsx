// frontend/src/app/historial/page.tsx - .
'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Refresh,
  Download,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { servidorApi } from '@/lib/api';
import { Analisis } from '@/types/tipos';

export default function PaginaHistorial() {
  const router = useRouter();
  const [analisis, setAnalisis] = useState<Analisis[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const respuesta = await servidorApi.obtenerHistorial();
      
      // .: Usar 'datos' en lugar de 'data'
      if (respuesta.exito && respuesta.datos) {
        // El backend puede devolver diferentes estructuras
        const datosBackend = respuesta.datos;
        
        // Verificar diferentes estructuras de respuesta
        let datosAnalisis: Analisis[] = [];
        
        if (Array.isArray(datosBackend)) {
          // Caso 1: El backend devuelve un array directamente
          datosAnalisis = datosBackend;
        } else if (datosBackend.data && Array.isArray(datosBackend.data)) {
          // Caso 2: El backend devuelve { data: [...], success: true }
          datosAnalisis = datosBackend.data;
        } else if (datosBackend.datos && Array.isArray(datosBackend.datos)) {
          // Caso 3: El backend devuelve { datos: [...], exito: true }
          datosAnalisis = datosBackend.datos;
        }
        
        setAnalisis(datosAnalisis);
      } else if (!respuesta.exito && respuesta.mensaje) {
        setError(respuesta.mensaje);
      } else {
        setError('Error cargando historial: respuesta inválida');
      }
    } catch (err: any) {
      console.error('Error en cargarHistorial:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaString: string) => {
    try {
      return new Date(fechaString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const obtenerColorDiagnostico = (diagnostico: string) => {
    return diagnostico === 'NORMAL' ? 'success' : 'error';
  };

  const exportarHistorial = () => {
    if (analisis.length === 0) return;

    const encabezados = [
      'Fecha',
      'Diagnóstico',
      'Confianza (%)',
      'Probabilidad Normal (%)',
      'Probabilidad Neumonía (%)',
      'Imagen (URL)',
      'Comentarios'
    ].join(';');

    const filas = analisis.map(a => [
      formatearFecha(a.fecha),
      a.diagnostico,
      a.confianza?.toFixed(2) || '0',
      ((a.probabilidades?.normal || 0) * 100).toFixed(1),
      ((a.probabilidades?.neumonia || 0) * 100).toFixed(1),
      a.imagen_url || '',
      a.comentarios || 'Sin comentarios'
    ].join(';'));

    const contenidoCSV = '\uFEFF' + [encabezados, ...filas].join('\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial-neumonia-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Mi Historial de Análisis
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={cargarHistorial}
            disabled={cargando}
          >
            Actualizar
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportarHistorial}
            disabled={analisis.length === 0 || cargando}
          >
            Exportar CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Box sx={{ mt: 1 }}>
            <Button 
              size="small" 
              onClick={cargarHistorial}
              disabled={cargando}
            >
              Reintentar
            </Button>
          </Box>
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Cargando historial...</Typography>
        </Box>
      ) : analisis.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay análisis en tu historial
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Realiza tu primer análisis para verlo aquí
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/analisis')}
            >
              Ir a Análisis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {analisis.length} análisis
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Imagen</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Diagnóstico</TableCell>
                    <TableCell>Confianza</TableCell>
                    <TableCell>Probabilidades</TableCell>
                    <TableCell>Comentarios</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analisis.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.imagen_url ? (
                          <img 
                            src={item.imagen_url} 
                            alt="Radiografía" 
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : (
                          <Box sx={{ width: 60, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>{formatearFecha(item.fecha)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.diagnostico || 'N/A'}
                          color={obtenerColorDiagnostico(item.diagnostico || 'NORMAL')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.confianza?.toFixed(1) || '0'}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="caption" color="success.main">
                            Normal: {((item.probabilidades?.normal || 0) * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="caption" color="error.main">
                            Neumonía: {((item.probabilidades?.neumonia || 0) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.comentarios || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
