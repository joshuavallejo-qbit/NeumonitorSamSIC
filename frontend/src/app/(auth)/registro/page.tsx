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
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, Info, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { servidorApi } from '@/lib/api';

// Definir tipos
interface FormularioRegistro {
  // Paso 1: Información básica
  nombre_completo: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
  direccion?: string;
  
  // Paso 2: Información demográfica
  fecha_nacimiento: string;
  tipo_zona: 'urbana' | 'periurbana' | 'rural' | 'comunidad_dificil';
  situacion_economica: 'ingresos_limites' | 'ingresos_moderados' | 'ingresos_estables' | 'prefiero_no_responder';
  acceso_salud: 'muy_dificil' | 'dificil' | 'acceso_moderado' | 'facil_acceso' | 'atencion_privada';
  
  // Paso 3: Experiencias COVID
  experiencias_covid: {
    diagnosticado: boolean;
    hospitalizado: boolean;
    secuelas_respiratorias: boolean;
    perdida_empleo: boolean;
    sin_covid: boolean;
  };
}

const steps = ['Información básica', 'Información demográfica', 'Experiencias COVID'];

// Opciones para selectores
const opcionesZona = [
  { value: 'urbana', label: 'Zona urbana (ciudad)' },
  { value: 'periurbana', label: 'Zona periurbana' },
  { value: 'rural', label: 'Zona rural' },
  { value: 'comunidad_dificil', label: 'Comunidad de difícil acceso' }
];

const opcionesEconomica = [
  { value: 'ingresos_limites', label: 'Ingresos limitados (dificultad para cubrir gastos médicos)' },
  { value: 'ingresos_moderados', label: 'Ingresos moderados' },
  { value: 'ingresos_estables', label: 'Ingresos estables' },
  { value: 'prefiero_no_responder', label: 'Prefiero no responder' }
];

const opcionesAccesoSalud = [
  { value: 'muy_dificil', label: 'Muy difícil (más de 1 hora de traslado)' },
  { value: 'dificil', label: 'Difícil' },
  { value: 'acceso_moderado', label: 'Acceso moderado' },
  { value: 'facil_acceso', label: 'Fácil acceso' },
  { value: 'atencion_privada', label: 'Atención privada frecuente' }
];

export default function PaginaRegistro() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [pasoActivo, setPasoActivo] = useState(0);
  const [resultadoVulnerabilidad, setResultadoVulnerabilidad] = useState<any>(null);
  const router = useRouter();

  const toggleMostrarPassword = () => setMostrarPassword(!mostrarPassword);
  const toggleMostrarConfirmPassword = () => setMostrarConfirmPassword(!mostrarConfirmPassword);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
    trigger
  } = useForm<FormularioRegistro>({
  defaultValues: {
    // Paso 2 (RADIOS)
    tipo_zona: undefined,
    situacion_economica: undefined,
    acceso_salud: undefined,

    // Paso 3
    experiencias_covid: {
      diagnosticado: false,
      hospitalizado: false,
      secuelas_respiratorias: false,
      perdida_empleo: false,
      sin_covid: false
    }
  },
  mode: 'onChange'
});

  const password = watch('password');

  const validarPasoActual = async () => {
    let campos: string[] = [];
    
    switch (pasoActivo) {
      case 0:
        campos = ['nombre_completo', 'email', 'password', 'confirmarPassword'];
        break;
      case 1:
        campos = ['fecha_nacimiento', 'tipo_zona', 'situacion_economica', 'acceso_salud'];
        break;
      case 2:
        // El paso 3 no tiene validación obligatoria
        return true;
    }
    
    const resultado = await trigger(campos as any);
    return resultado;
  };

  const siguientePaso = async () => {
    const esValido = await validarPasoActual();
    if (esValido && pasoActivo < steps.length - 1) {
      setPasoActivo(pasoActivo + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActivo > 0) {
      setPasoActivo(pasoActivo - 1);
    }
  };

  const calcularVulnerabilidadPreliminar = (datos: Partial<FormularioRegistro>) => {
    if (!datos.fecha_nacimiento || !datos.tipo_zona || !datos.situacion_economica || !datos.experiencias_covid) {
      return null;
    }

    const hoy = new Date();
    const fechaNac = new Date(datos.fecha_nacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    let factores = 0;
    const motivos: string[] = [];

    if (edad > 56) {
      factores++;
      motivos.push(`Edad > 56 años (${edad})`);
    }

    if (datos.tipo_zona === 'rural' || datos.tipo_zona === 'comunidad_dificil') {
      factores++;
      motivos.push(`Zona ${datos.tipo_zona}`);
    }

    if (datos.situacion_economica === 'ingresos_limites') {
      factores++;
      motivos.push('Ingresos limitados');
    }

    if (datos.experiencias_covid.hospitalizado) {
      factores++;
      motivos.push('Hospitalización por COVID-19');
    }

    let nivel = 'BAJA';
    let prioridad = 'BAJA';
    
    if (factores >= 3) {
      nivel = 'ALTA';
      prioridad = 'ALTA';
    } else if (factores >= 1) {
      nivel = 'MEDIA';
      prioridad = 'MEDIA';
    }

    return { nivel, prioridad, factores, motivos, edad };
  };
// En la función enviarRegistro, cambiar:

const enviarRegistro = async (datos: FormularioRegistro) => {
  setCargando(true);
  setError(null);

  try {
    // VALIDACIÓN: Verificar que al menos una opción de COVID esté seleccionada
    const experienciasSeleccionadas = Object.values(datos.experiencias_covid).some(v => v === true);
    if (!experienciasSeleccionadas) {
      setError('Debes seleccionar al menos una experiencia relacionada con COVID-19');
      setCargando(false);
      return;
    }

    // Calcular vulnerabilidad preliminar para mostrar al usuario
    const vulnerabilidad = calcularVulnerabilidadPreliminar(datos);
    setResultadoVulnerabilidad(vulnerabilidad);

    // Mostrar confirmación antes de enviar
    const confirmar = window.confirm(
      `¿Estás seguro de registrar tu cuenta?\n\n` +
      `Nivel de vulnerabilidad calculado: ${vulnerabilidad?.nivel || 'BAJA'}\n` +
      `Se registrarán tus respuestas para análisis médico.`
    );
    
    if (!confirmar) {
      setCargando(false);
      return;
    }

    const datosRegistro = {
      email: datos.email,
      password: datos.password,
      nombre_completo: datos.nombre_completo,
      telefono: datos.telefono || '',
      direccion: datos.direccion || '',
      fecha_nacimiento: datos.fecha_nacimiento,
      tipo_zona: datos.tipo_zona,
      situacion_economica: datos.situacion_economica,
      acceso_salud: datos.acceso_salud,
      experiencias_covid: datos.experiencias_covid
    };

    const respuesta = await servidorApi.registro(datosRegistro as any);
    
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

  // Renderizar paso actual
  const renderPaso = () => {
    switch (pasoActivo) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            
            <Grid container spacing={3}>
                <Grid size={{ xs: 12}}>

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

<Grid size={{ xs: 12, md: 6 }}>
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

<Grid size={{ xs: 12, md: 6 }}>
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

<Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                  fullWidth
                  label="Teléfono"
                  {...register('telefono')}
                />
              </Grid>

<Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                  fullWidth
                  label="Dirección"
                  {...register('direccion')}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información Demográfica
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Esta información nos ayuda a priorizar y entender el impacto social post-pandemia.
            </Typography>
            
            <Grid container spacing={3}>
<Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('fecha_nacimiento', {
                    required: 'La fecha de nacimiento es requerida'
                  })}
                  error={!!errors.fecha_nacimiento}
                  helperText={errors.fecha_nacimiento?.message}
                />
              </Grid>

<Grid size={{ xs: 12, md: 6 }}>
                  <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">¿En qué tipo de zona resides actualmente?</FormLabel>
                  <Controller
                    name="tipo_zona"
                    control={control}
                    rules={{ required: 'Este campo es requerido' }}
                    render={({ field }) => (
<RadioGroup {...field} value={field.value ?? ''}>
                        {opcionesZona.map((opcion) => (
                          <FormControlLabel
                            key={opcion.value}
                            value={opcion.value}
                            control={<Radio />}
                            label={opcion.label}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.tipo_zona && (
                    <Typography color="error" variant="caption">
                      {errors.tipo_zona.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

<Grid size={{ xs: 12, md: 6 }}>
                  <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">¿Cómo describirías tu situación económica actual?</FormLabel>
                  <Controller
                    name="situacion_economica"
                    control={control}
                    rules={{ required: 'Este campo es requerido' }}
                    render={({ field }) => (
<RadioGroup {...field} value={field.value ?? ''}>
                        {opcionesEconomica.map((opcion) => (
                          <FormControlLabel
                            key={opcion.value}
                            value={opcion.value}
                            control={<Radio />}
                            label={opcion.label}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.situacion_economica && (
                    <Typography color="error" variant="caption">
                      {errors.situacion_economica.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

<Grid size={{ xs: 12, md: 6 }}>
                  <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">¿Qué tan fácil es para ti acceder a un centro de salud?</FormLabel>
                  <Controller
                    name="acceso_salud"
                    control={control}
                    rules={{ required: 'Este campo es requerido' }}
                    render={({ field }) => (
<RadioGroup {...field} value={field.value ?? ''}>
                        {opcionesAccesoSalud.map((opcion) => (
                          <FormControlLabel
                            key={opcion.value}
                            value={opcion.value}
                            control={<Radio />}
                            label={opcion.label}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.acceso_salud && (
                    <Typography color="error" variant="caption">
                      {errors.acceso_salud.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Experiencias durante la pandemia COVID-19
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Durante la pandemia de COVID-19 (2020–2021), ¿tuviste alguna de las siguientes experiencias?
              (Selección múltiple)
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <Controller
                name="experiencias_covid"
                control={control}
                render={({ field }) => (
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value.diagnosticado}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            diagnosticado: e.target.checked
                          })}
                        />
                      }
                      label="Fui diagnosticado/a con COVID-19"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value.hospitalizado}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            hospitalizado: e.target.checked
                          })}
                        />
                      }
                      label="Fui hospitalizado/a por COVID-19"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value.secuelas_respiratorias}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            secuelas_respiratorias: e.target.checked
                          })}
                        />
                      }
                      label="Presenté secuelas respiratorias después del COVID-19"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value.perdida_empleo}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            perdida_empleo: e.target.checked
                          })}
                        />
                      }
                      label="Perdí mi empleo o ingresos por la pandemia"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value.sin_covid}
                          onChange={(e) => field.onChange({
                            ...field.value,
                            sin_covid: e.target.checked
                          })}
                        />
                      }
                      label="No presenté COVID-19 ni secuelas conocidas"
                    />
                  </FormGroup>
                )}
              />
            </FormControl>
<Box sx={{ mt: 2, mb: 2 }}>
  <Alert severity="info">
    <Typography variant="body2">
      <strong>Nota:</strong> Debes seleccionar al menos una opción relacionada con COVID-19 para continuar.
    </Typography>
  </Alert>
</Box>
            {/* Vista previa de vulnerabilidad */}
            {resultadoVulnerabilidad && (
              <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    🎯 Evaluación Preliminar de Vulnerabilidad
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip
                      label={`Nivel: ${resultadoVulnerabilidad.nivel}`}
                      color={
                        resultadoVulnerabilidad.nivel === 'ALTA' ? 'error' :
                        resultadoVulnerabilidad.nivel === 'MEDIA' ? 'warning' : 'success'
                      }
                      size="medium"
                    />
                    <Chip
                      label={`Prioridad: ${resultadoVulnerabilidad.prioridad}`}
                      color={
                        resultadoVulnerabilidad.prioridad === 'ALTA' ? 'error' :
                        resultadoVulnerabilidad.prioridad === 'MEDIA' ? 'warning' : 'success'
                      }
                      variant="outlined"
                      size="medium"
                    />
                  </Box>
                  <Typography variant="body2">
                    Factores de riesgo identificados: {resultadoVulnerabilidad.factores}
                  </Typography>
                  {resultadoVulnerabilidad.motivos.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Motivos: {resultadoVulnerabilidad.motivos.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Esta información nos ayuda a brindarte un mejor servicio y priorizar la atención según tu perfil.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Crear Cuenta
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Regístrate para acceder al sistema de detección de neumonía
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={pasoActivo} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(enviarRegistro)}>
          {renderPaso()}
          
          {/* Navegación entre pasos */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={pasoAnterior}
              disabled={pasoActivo === 0 || cargando}
            >
              Anterior
            </Button>
            
            {pasoActivo < steps.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={siguientePaso}
                disabled={cargando}
              >
                Siguiente
              </Button>
            ) : (
<Button
  type="submit"
  variant="contained"
  disabled={
    cargando ||
    !Object.values(watch('experiencias_covid')).some(v => v === true)
  }
  sx={{ minWidth: 120 }}
>

                {cargando ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Completar Registro'
                )}
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          ¿Ya tienes cuenta?{' '}
          <Button
            variant="text"
            size="small"
            onClick={() => router.push('/login')}
          >
            Inicia sesión aquí
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
}