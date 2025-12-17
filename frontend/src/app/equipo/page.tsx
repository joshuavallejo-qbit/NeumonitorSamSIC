
'use client';

import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Box,
  Chip,
  Stack,
  Divider,
  Paper,
  alpha,
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  useMediaQuery
} from '@mui/material';
import {
  Code,
  Dataset,
  Psychology,
  Storage,
  Description,
  Group
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface MiembroEquipo {
  nombre: string;
  rol: string;
  descripcion: string[];
  icono?: React.ReactNode;
  color: string;
  foto?: string;
}

export default function PaginaEquipo() {
  const tema = useTheme();
  const esPantallaPequena = useMediaQuery(tema.breakpoints.down('sm'));
  const esTablet = useMediaQuery(tema.breakpoints.down('md'));

  const miembros: MiembroEquipo[] = [
    {
      nombre: "John Villacís Ramón",
      rol: "Specialist en dataset & preprocesamiento",
      descripcion: [
        "Encargado de recopilar, depurar y estandarizar el dataset de radiografías",
        "Responsable de generación de imágenes aumentadas",
        "Manejo y preparación de datos médicos"
      ],
      color: tema.palette.primary.main,
      foto: "/fotos-equipo/john-villacis.jpg"
    },
    {
      nombre: "Joshua Vallejo Luna",
      rol: "Machine Learning Engineer",
      descripcion: [
        "Entrena, evalúa y optimiza el modelo CNN para detección de neumonía",
        "Supervisa métricas e hiperparámetros del modelo",
        "Implementación de algoritmos de IA"
      ],
      color: tema.palette.secondary.main,
      foto: "/fotos-equipo/joshua-vallejo.jpeg"
    },
    {
      nombre: "Juan Larrea Martínez",
      rol: "Backend & API Developer",
      descripcion: [
        "Implementa la API de predicción (FastAPI/Flask)",
        "Manejo de imágenes y comunicación entre modelo y frontend",
        "Infraestructura del servidor"
      ],
      color: tema.palette.info.main,
      foto: "/fotos-equipo/juan-larrea.jpg"
    },
    {
      nombre: "Joshúa Castillo Merejildo",
      rol: "Frontend Developer",
      descripcion: [
        "Diseña e implementa la interfaz web y experiencia de usuario",
        "Visualización de resultados y dashboards",
        "Integración con API backend"
      ],
      color: tema.palette.success.main,
      foto: "/fotos-equipo/joshua-castillo.jpg"
    },
    {
      nombre: "Brithany Suárez Palacios",
      rol: "Documentation & Communication Analyst",
      descripcion: [
        "Responsable de documentación técnica del proyecto",
        "Redacción y presentación de documentación",
        "Gestión de comunicaciones del equipo"
      ],
      color: tema.palette.warning.main,
      foto: "/fotos-equipo/britany-suarez.jpg"
    }
  ];

  const proyectoInfo = {
    nombre: "Neumonitor",
    descripcion: "Sistema web de detección automática de neumonía mediante inteligencia artificial",
    objetivos: [
      "Proporcionar diagnósticos preliminares rápidos y accesibles",
      "Asistir a profesionales médicos en la detección temprana",
      "Reducir tiempos de diagnóstico mediante IA",
      "Ofrecer una interfaz intuitiva para análisis de radiografías"
    ],
    tecnologias: [
      "React/Next.js", "TypeScript", "Material-UI",
      "FastAPI/Python", "TensorFlow/Keras", "MobileNetV2"
    ]
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* Encabezado */}
      <Box textAlign="center" mb={{ xs: 3, sm: 4, md: 6 }}>
        <Group 
          sx={{ 
            fontSize: { xs: 40, sm: 50, md: 60 }, 
            color: tema.palette.primary.main, 
            mb: { xs: 1, sm: 2 } 
          }} 
        />
        <Typography 
          variant={esPantallaPequena ? "h4" : "h3"} 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{ px: { xs: 1, sm: 2 } }}
        >
          Equipo de Desarrollo
        </Typography>
        <Typography 
          variant={esPantallaPequena ? "body1" : "h6"} 
          gutterBottom 
          fontWeight="bold"
          sx={{ px: { xs: 2, sm: 3, md: 4 } }}
        >
          Conoce al equipo "NeumoScanners" detrás de {proyectoInfo.nombre} - {proyectoInfo.descripcion}
        </Typography>
      </Box>

      {/* Información del Proyecto */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 3, sm: 4, md: 6 }, 
          borderRadius: 2,
          background:
            tema.palette.mode === 'dark'
              ? `linear-gradient(135deg,
                  ${alpha(tema.palette.primary.dark, 0.35)} 0%,
                  ${alpha(tema.palette.secondary.dark, 0.35)} 100%)`
              : `linear-gradient(135deg,
                  ${alpha(tema.palette.primary.light, 0.15)} 0%,
                  ${alpha(tema.palette.secondary.light, 0.15)} 100%)`,
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography 
              variant={esPantallaPequena ? "h6" : "h5"} 
              gutterBottom 
              fontWeight="bold"
            >
              {proyectoInfo.nombre}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {proyectoInfo.descripcion}
            </Typography>
            
            <Typography 
              variant={esPantallaPequena ? "subtitle1" : "h6"} 
              gutterBottom 
              mt={{ xs: 2, sm: 3 }}
              fontWeight="bold"
            >
              Objetivos del Sistema:
            </Typography>
            <Stack spacing={1}>
              {proyectoInfo.objetivos.map((objetivo, index) => (
                <Box key={index} display="flex" alignItems="flex-start">
                  <Box 
                    sx={{ 
                      minWidth: 8,
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: tema.palette.primary.main,
                      mr: { xs: 1.5, sm: 2 },
                      mt: 0.75
                    }} 
                  />
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    {objetivo}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography 
              variant={esPantallaPequena ? "subtitle1" : "h6"} 
              gutterBottom 
              fontWeight="bold"
            >
              Tecnologías Utilizadas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {proyectoInfo.tecnologias.map((tech, index) => (
                <Chip 
                  key={index}
                  label={tech}
                  variant="outlined"
                  size={esPantallaPequena ? "small" : "medium"}
                  sx={{
                    borderColor:
                      tema.palette.mode === 'dark'
                        ? tema.palette.primary.light
                        : tema.palette.primary.main,
                    color:
                      tema.palette.mode === 'dark'
                        ? tema.palette.primary.light
                        : tema.palette.primary.main,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Miembros del Equipo */}
      <Typography 
        variant={esPantallaPequena ? "h5" : "h4"} 
        component="h2" 
        gutterBottom 
        mb={{ xs: 2, sm: 3, md: 4 }}
        fontWeight="bold"
      >
        Nuestro Equipo
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {miembros.map((miembro, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Card
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-8px)' },
                  boxShadow: tema.shadows[8]
                }
              }}
            >
              {/* Foto del miembro */}
              <Box
                sx={{
                  height: { xs: 160, sm: 180, md: 200 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  py: 2
                }}
              >
                <CardMedia
                  component="img"
                  image={miembro.foto || "/default-avatar.png"}
                  alt={miembro.nombre}
                  sx={{
                    width: { xs: 100, sm: 110, md: 120 },
                    height: { xs: 100, sm: 110, md: 120 },
                    borderRadius: '50%',
                    border: `3px solid ${miembro.color}`,
                    objectFit: 'cover'
                  }}
                />

                {/* Indicador de rol */}
                <Chip
                  label={miembro.rol.split(' ')[0]}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: { xs: 8, sm: 12, md: 16 },
                    right: { xs: 8, sm: 12, md: 16 },
                    bgcolor: miembro.color,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.65rem', sm: '0.75rem' }
                  }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography 
                  variant={esPantallaPequena ? "subtitle1" : "h6"} 
                  component="h3" 
                  gutterBottom 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
                >
                  {miembro.nombre}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' }, 
                    mb: 2 
                  }}
                >
                  {miembro.rol}
                </Typography>

                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                <Stack spacing={{ xs: 0.75, sm: 1 }}>
                  {miembro.descripcion.map((item, idx) => (
                    <Box key={idx} display="flex" alignItems="flex-start">
                      <Box 
                        sx={{ 
                          minWidth: { xs: 6, sm: 8 },
                          width: { xs: 6, sm: 8 },
                          height: { xs: 6, sm: 8 },
                          borderRadius: '50%',
                          bgcolor: miembro.color,
                          mt: { xs: 0.5, sm: 0.75 },
                          mr: { xs: 1, sm: 1.5 }
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' } }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabla de Resumen */}
      <Box sx={{ mt: { xs: 3, sm: 4, md: 6 } }}>
        <Paper
          elevation={2}
          sx={{
            backgroundColor: tema.palette.background.paper,
            p: { xs: 2, sm: 3 }
          }}
        >
          <Typography 
            variant={esPantallaPequena ? "subtitle1" : "h6"} 
            gutterBottom 
            fontWeight="bold"
            sx={{ mb: { xs: 2, sm: 3 } }}
          >
            Resumen de Roles y Responsabilidades
          </Typography>

          <Box sx={{ overflowX: 'auto' }}>
            <Table 
              sx={{ 
                minWidth: { xs: 600, sm: 650 }, 
                borderCollapse: 'collapse' 
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: tema.palette.background.default,
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: tema.palette.text.primary,
                      borderBottom: `2px solid ${tema.palette.divider}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '8px', sm: '12px' }
                    }}
                  >
                    Nombre
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: tema.palette.text.primary,
                      borderBottom: `2px solid ${tema.palette.divider}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '8px', sm: '12px' }
                    }}
                  >
                    Rol Principal
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: tema.palette.text.primary,
                      borderBottom: `2px solid ${tema.palette.divider}`,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '8px', sm: '12px' }
                    }}
                  >
                    Áreas de Especialización
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {miembros.map((miembro, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      borderBottom: `1px solid ${tema.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        padding: { xs: '8px', sm: '12px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {miembro.nombre}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        padding: { xs: '8px', sm: '12px' },
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' }
                      }}
                    >
                      {miembro.rol}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        padding: { xs: '8px', sm: '12px' }
                      }}
                    >
                      <Stack spacing={0.5}>
                        {miembro.descripcion.map((item, idx) => (
                          <Typography 
                            key={idx} 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                          >
                            • {item}
                          </Typography>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>

      {/* Sección de Contacto/Colaboración */}
      <Box 
        sx={{ 
          mt: { xs: 4, sm: 6, md: 8 }, 
          p: { xs: 2, sm: 3, md: 4 }, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor:
            tema.palette.mode === 'dark'
              ? alpha(tema.palette.primary.main, 0.15)
              : alpha(tema.palette.primary.main, 0.05),
          border: `1px solid ${alpha(tema.palette.primary.main, 0.2)}`
        }}
      >
        <Typography 
          variant={esPantallaPequena ? "h6" : "h5"} 
          gutterBottom 
          fontWeight="bold"
          sx={{ px: { xs: 1, sm: 2 } }}
        >
          ¿Interesado en Colaborar?
        </Typography>
        <Typography 
          variant={esPantallaPequena ? "body2" : "h6"} 
          gutterBottom 
          fontWeight="bold"
          sx={{ px: { xs: 2, sm: 3, md: 4 } }}
        >
          Este proyecto está en constante desarrollo. Si eres profesional de la salud, 
          desarrollador o investigador y quieres contribuir, no dudes en contactarnos.
        </Typography>
      </Box>
    </Container>
  );
}
