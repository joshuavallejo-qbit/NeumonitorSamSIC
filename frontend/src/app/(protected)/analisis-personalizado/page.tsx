//frontend/src/app/(protected)/analisis-personalizado/page.tsx:

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
} from '@mui/material';
import { 
  CloudUpload, 
  Refresh, 
  Error as ErrorIcon, 
  ExpandMore,
  Person,
  LocationOn,
  AttachMoney,
  HealthAndSafety,
  MedicalServices,
  Warning
} from '@mui/icons-material';
import { servidorApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ResultadoAnalisisPersonalizado {
  diagnostico: 'NORMAL' | 'NEUMONIA' | 'PNEUMONIA';
  confianza: number;
  probabilidades: {
    normal: number;
    neumonia: number;
  };
  autenticado?: boolean;
  mensaje?: string;
  error?: string;
  explicacion?: string;
  vulnerabilidad?: {
    nivel: string;
    prioridad: string;
    explicacion: string;
  };
  data?: {
    detalles_analisis?: string;
    nivel_vulnerabilidad_paciente?: string;
    prioridad_atencion_sugerida?: string;
    explicacion_vulnerabilidad?: string;
  };
}

interface PerfilSalud {
  fecha_nacimiento?: string;
  tipo_zona?: string;
  situacion_economica?: string;
  acceso_salud?: string;
  experiencias_covid?: any;
  nivel_vulnerabilidad?: string;
  prioridad_atencion?: string;
}

export default function PaginaAnalisisPersonalizado() {
  const [imagen, setImagen] = useState<File | null>(null);
  const [resultado, setResultado] = useState<ResultadoAnalisisPersonalizado | null>(null);
  const [imagenPrevisualizacion, setImagenPrevisualizacion] = useState<string | null>(null);
  const [notificacion, setNotificacion] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [perfilSalud, setPerfilSalud] = useState<PerfilSalud | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    cargarPerfilSalud();
  }, []);
  
  const cargarPerfilSalud = async () => {
    try {
      setCargandoPerfil(true);
      const respuesta = await servidorApi.obtenerPerfilSalud();
      
      if (respuesta.exito && respuesta.datos) {
        setPerfilSalud(respuesta.datos);
      } else {
        console.log('No se encontró perfil de salud:', respuesta.mensaje);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setCargandoPerfil(false);
    }
  };
  
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
      console.log('Iniciando envio de análisis personalizado...');
      
      // Usar el endpoint de análisis personalizado para usuarios autenticados
      const respuesta = await servidorApi.subirAnalisis(imagen, 'Análisis personalizado');
      console.log('Respuesta del servidor:', respuesta);
      
      if (respuesta.exito && respuesta.datos) {
const datosResultado: ResultadoAnalisisPersonalizado = {
  ...respuesta.datos,
  probabilidades: respuesta.datos?.probabilidades ?? {
    normal: 0,
    neumonia: 0
  }
};
setResultado(datosResultado);
        setNotificacion({ 
          mensaje: 'Análisis personalizado completado exitosamente', 
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
      console.error('Error en análisis personalizado:', error);
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
  
  const obtenerColorVulnerabilidad = (nivel: string) => {
    switch (nivel?.toUpperCase()) {
      case 'ALTA': return 'error';
      case 'MEDIA': return 'warning';
      case 'BAJA': return 'success';
      default: return 'default';
    }
  };
  
  const calcularEdad = (fechaNacimiento: string) => {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };
  
  const formatearZona = (zona: string) => {
    const zonas: {[key: string]: string} = {
      'urbana': 'Zona urbana (ciudad)',
      'periurbana': 'Zona periurbana',
      'rural': 'Zona rural',
      'comunidad_dificil': 'Comunidad de difícil acceso'
    };
    return zonas[zona] || zona;
  };
  
  const formatearSituacionEconomica = (situacion: string) => {
    const situaciones: {[key: string]: string} = {
      'ingresos_limites': 'Ingresos limitados',
      'ingresos_moderados': 'Ingresos moderados',
      'ingresos_estables': 'Ingresos estables',
      'prefiero_no_responder': 'Prefiero no responder'
    };
    return situaciones[situacion] || situacion;
  };
  
  const formatearAccesoSalud = (acceso: string) => {
    const accesos: {[key: string]: string} = {
      'muy_dificil': 'Muy difícil (más de 1 hora)',
      'dificil': 'Difícil',
      'acceso_moderado': 'Acceso moderado',
      'facil_acceso': 'Fácil acceso',
      'atencion_privada': 'Atención privada frecuente'
    };
    return accesos[acceso] || acceso;
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
        Análisis Personalizado con Perfil de Salud
      </Typography>
      
      <Typography variant="h6" gutterBottom color="text.secondary">
        Análisis de radiografías con evaluación de vulnerabilidad basada en tu perfil de salud
      </Typography>
      
      <Grid container spacing={4}>
        {/* Columna izquierda: Subir imagen */}
<Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                 Subir Radiografía
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
                  variant="contained"
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
                    color="primary"
                    disabled={cargando || !imagen}
                    fullWidth
                    sx={{ minHeight: '48px' }}
                    onClick={enviarAnalisis}
                  >
                    {cargando ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      '🔍 Analizar con Perfil Personalizado'
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
        
        {/* Columna derecha: Resultados */}
<Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Resultados del Análisis Personalizado
              </Typography>
              
              {cargando && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Procesando imagen y evaluando vulnerabilidad...
                  </Typography>
                  <LinearProgress sx={{ mt: 1 }} />
                </Box>
              )}
              
              {resultado && !resultado.error && (
                <Box sx={{ mt: 2 }}>
                  {resultado.mensaje && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {resultado.mensaje}
                    </Alert>
                  )}
                  
                  {/* Diagnóstico principal */}
                  <Alert
                    severity={resultado.diagnostico === 'NORMAL' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                    icon={resultado.diagnostico === 'NORMAL' ? undefined : <Warning />}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      🩺 Diagnóstico: {resultado.diagnostico}
                    </Typography>
                    <Typography variant="body2">
                      📈 Confianza del modelo: {resultado.confianza}%
                    </Typography>
                  </Alert>
                  <Typography variant="caption" color="text.secondary">
                    ℹ️ La confianza indica qué tan seguro está el modelo al comparar diagnósticos posibles.
                    Un valor menor al 80% no implica un error, sino mayor ambigüedad en la imagen.
                  </Typography>

                  
                  
                  {/* Información de vulnerabilidad */}
                  {resultado.vulnerabilidad && (
                    <Accordion sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            🎯 Evaluación de Vulnerabilidad
                          </Typography>
                          <Chip
                            label={resultado.vulnerabilidad.nivel}
                            color={obtenerColorVulnerabilidad(resultado.vulnerabilidad.nivel)}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="medium">
                              Nivel de vulnerabilidad:
                            </Typography>
                            <Chip
                              label={resultado.vulnerabilidad.nivel}
                              color={obtenerColorVulnerabilidad(resultado.vulnerabilidad.nivel)}
                              size="small"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight="medium">
                              Prioridad de atención:
                            </Typography>
                            <Chip
                              label={resultado.vulnerabilidad.prioridad}
                              color={obtenerColorVulnerabilidad(resultado.vulnerabilidad.prioridad)}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="body2" color="text.secondary">
                            {resultado.vulnerabilidad.explicacion}
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  {/* Explicación detallada */}
                  {resultado.data?.detalles_analisis && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">
                          🔍 Explicación Detallada del Análisis
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'background.default',
                            whiteSpace: 'pre-line',
                            fontSize: '0.875rem'
                          }}
                        >
                          {resultado.data.detalles_analisis}
                        </Paper>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  {/* Recomendación final */}
                  <Alert 
                    severity={
                      resultado.diagnostico === 'NORMAL' ? 'success' : 
                      resultado.vulnerabilidad?.nivel === 'ALTA' ? 'error' : 'warning'
                    }
                    sx={{ mt: 2 }}
                  >
                    {resultado.diagnostico === 'NORMAL' 
                      ? '✅ La radiografía muestra patrones normales. Continúe con chequeos regulares.'
                      : resultado.vulnerabilidad?.nivel === 'ALTA'
                      ? '🚨 Se detectó neumonía en paciente de ALTA vulnerabilidad. Consulte URGENTEMENTE con un médico.'
                      : resultado.vulnerabilidad?.nivel === 'MEDIA'
                      ? '⚠️ Se detectó neumonía en paciente con vulnerabilidad media. Consulte PRONTO con un médico.'
                      : '⚠️ Siempre consulte con un médico para evaluación.'}
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
                    Los resultados del análisis personalizado aparecerán aquí.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Incluirán evaluación de vulnerabilidad basada en tu perfil de salud.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Nota informativa */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>📝 Nota importante:</strong> Este análisis personalizado incluye evaluación de vulnerabilidad 
          basada en tu perfil de salud registrado. Los usuarios no autenticados reciben un análisis estándar 
          sin información personalizada. 
          <Button 
            size="small" 
            sx={{ ml: 1 }}
            onClick={() => router.push('/historial')}
          >
            Ver mi historial completo
          </Button>
        </Typography>
      </Alert>
    </Container>
  );
}
