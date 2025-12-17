// frontend/src/app/(public)/analisis/page.tsx - . pública
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  LinearProgress,
  Chip,
  Snackbar,
} from '@mui/material';
import { CloudUpload, Refresh, Error as ErrorIcon, Login } from '@mui/icons-material';
import { servidorApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ResultadoAnalisis {
  diagnostico: 'NORMAL' | 'NEUMONIA';
  confianza: number;
  clase_index: number;
  probabilidades: {
    normal: number;
    neumonia: number;
  };
  autenticado?: boolean;
  mensaje?: string;
  error?: string;
}

export default function PaginaAnalisisPublico() {
  const [imagen, setImagen] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [imagenPrevisualizacion, setImagenPrevisualizacion] = useState<string | null>(null);
  const [notificacion, setNotificacion] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Verificar autenticación pero NO redirigir
    const token = localStorage.getItem('auth_token');
    setAutenticado(!!token);
  }, []);
  
  useEffect(() => {
    if (errorValidacion) {
      const timer = setTimeout(() => setErrorValidacion(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorValidacion]);
  
  const manejarSeleccionImagen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (archivo) {
      // Validar tipo de archivo
      if (!archivo.type.match(/image\/(jpeg|jpg|png)/)) {
        setErrorValidacion('Formato de imagen no soportado. Use JPG, JPEG o PNG.');
        return;
      }
      
      // Validar tamaño (max 10MB)
      if (archivo.size > 10 * 1024 * 1024) {
        setErrorValidacion('La imagen es demasiado grande (máximo 10MB)');
        return;
      }
      
      setImagen(archivo);
      const urlPrevisualizacion = URL.createObjectURL(archivo);
      setImagenPrevisualizacion(urlPrevisualizacion);
      setResultado(null);
      setErrorValidacion(null);
    }
  };
  
  const manejarClickSeleccionar = () => {
    inputFileRef.current?.click();
  };
  
  const enviarAnalisis = async () => {
    if (!imagen) {
      setErrorValidacion('Debes seleccionar una imagen primero');
      return;
    }
    
    setCargando(true);
    setResultado(null);
    setErrorValidacion(null);
    
    try {
      console.log('Iniciando envio de análisis...');
      const respuesta = await servidorApi.predecir(imagen);
      console.log('Respuesta del servidor:', respuesta);
      
      if (respuesta.exito && respuesta.datos) {
        const datosResultado: ResultadoAnalisis = respuesta.datos;
        setResultado(datosResultado);
        
        setNotificacion({ 
          mensaje: 'Análisis completado exitosamente', 
          tipo: 'success' 
        });
      } else {
        setResultado({ 
          error: respuesta.mensaje || 'Error desconocido',
        } as any);
        setNotificacion({ 
          mensaje: respuesta.mensaje || 'Error en el análisis', 
          tipo: 'error' 
        });
      }
    } catch (error: any) {
      console.error('Error en análisis:', error);
      setResultado({ 
        error: 'Error procesando la solicitud',
      } as any);
      setNotificacion({ 
        mensaje: 'Error de conexión con el servidor', 
        tipo: 'error' 
      });
    } finally {
      setCargando(false);
    }
  };
  
  const reiniciarFormulario = () => {
    setImagen(null);
    setResultado(null);
    if (imagenPrevisualizacion) {
      URL.revokeObjectURL(imagenPrevisualizacion);
    }
    setImagenPrevisualizacion(null);
    setErrorValidacion(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };
  
  const cerrarNotificacion = () => {
    setNotificacion(null);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={!!notificacion}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={cerrarNotificacion} 
          severity={notificacion?.tipo} 
          sx={{ width: '100%' }}
        >
          {notificacion?.mensaje}
        </Alert>
      </Snackbar>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Análisis de Radiografías
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Sube una radiografía de tórax para analizar posibles signos de neumonía.
        Nuestra IA te proporcionará un diagnóstico preliminar.
      </Typography>
      
      {/* Banner de información para usuarios no autenticados */}
      {!autenticado && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<Login />}
              onClick={() => router.push('/login')}
            >
              Iniciar Sesión
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>¿Deseas guardar tu historial de análisis?</strong> Inicia sesión o regístrate
            para guardar todos tus análisis y acceder a ellos desde cualquier dispositivo.
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={4}>
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >            <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subir Imagen
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  ref={inputFileRef}
                  hidden
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={manejarSeleccionImagen}
                />
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ py: 2, mb: 2 }}
                  onClick={manejarClickSeleccionar}
                >
                  Seleccionar Radiografía
                </Button>
                
                {errorValidacion && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <ErrorIcon sx={{ mr: 1 }} />
                    {errorValidacion}
                  </Alert>
                )}
                
                {imagenPrevisualizacion && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Vista previa:
                    </Typography>
                    <Box
                      component="img"
                      src={imagenPrevisualizacion}
                      alt="Previsualización"
                      sx={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Archivo: {imagen?.name} ({Math.round((imagen?.size || 0) / 1024)} KB)
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    disabled={cargando || !imagen}
                    fullWidth
                    sx={{ minHeight: '48px' }}
                    onClick={enviarAnalisis}
                  >
                    {cargando ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Analizar Imagen'
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={reiniciarFormulario}
                    startIcon={<Refresh />}
                    disabled={cargando}
                  >
                    Reiniciar
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
<Grid sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, }} >            <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resultados del Análisis
              </Typography>
              
              {cargando && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Procesando imagen...
                  </Typography>
                  <LinearProgress sx={{ mt: 1 }} />
                </Box>
              )}
              
              {resultado && !resultado.error && (
                <Box sx={{ mt: 2 }}>
                  {resultado.autenticado && resultado.mensaje && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {resultado.mensaje}
                    </Alert>
                  )}
                  
                  <Alert
                    severity={resultado.diagnostico === 'NORMAL' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                    icon={resultado.diagnostico === 'NORMAL' ? undefined : <ErrorIcon />}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Diagnóstico: {resultado.diagnostico}
                    </Typography>
                    <Typography variant="body2">
                      Confianza: {resultado.confianza}%
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" gutterBottom>
                    Probabilidades:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={`Normal: ${(resultado.probabilidades.normal * 100).toFixed(1)}%`}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Neumonía: ${(resultado.probabilidades.neumonia * 100).toFixed(1)}%`}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Alert severity="info">
                    {resultado.diagnostico === 'NORMAL'
                      ? 'La radiografía muestra patrones normales. Sin embargo, siempre consulte con un médico para un diagnóstico definitivo.'
                      : 'Se detectaron patrones compatibles con neumonía. Consulte urgentemente con un profesional médico.'}
                  </Alert>
                
                </Box>
              )}
              
              {resultado?.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <ErrorIcon sx={{ mr: 1 }} />
                  {resultado.error}
                </Alert>
              )}
              
              {!cargando && !resultado && (
                <Box sx={{ mt: 2, textAlign: 'center', py: 4 }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Los resultados aparecerán aquí después del análisis.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}