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
  Table, TableHead, TableBody, TableRow, TableCell 
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
  foto?: string; // Ruta desde public
}

export default function PaginaEquipo() {
  const tema = useTheme();

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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Encabezado */}
      <Box textAlign="center" mb={6}>
        <Group sx={{ fontSize: 60, color: tema.palette.primary.main, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Equipo de Desarrollo
        </Typography>
            <Typography variant="h6" gutterBottom fontWeight="bold">
          Conoce al equipo "NeumoScanners" detrás de {proyectoInfo.nombre} - {proyectoInfo.descripcion}
        </Typography>
      </Box>

      {/* Información del Proyecto */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          mb: 6, 
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
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {proyectoInfo.nombre}
            </Typography>
            <Typography variant="body1" paragraph>
              {proyectoInfo.descripcion}
            </Typography>
            
            <Typography variant="h6" gutterBottom mt={3}>
              Objetivos del Sistema:
            </Typography>
            <Stack spacing={1}>
              {proyectoInfo.objetivos.map((objetivo, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: tema.palette.primary.main,
                      mr: 2 
                    }} 
                  />
                  <Typography variant="body2">{objetivo}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Tecnologías Utilizadas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {proyectoInfo.tecnologias.map((tech, index) => (
                <Chip 
                  key={index}
                  label={tech}
                  variant="outlined"
sx={{
  borderColor:
    tema.palette.mode === 'dark'
      ? tema.palette.primary.light
      : tema.palette.primary.main,
  color:
    tema.palette.mode === 'dark'
      ? tema.palette.primary.light
      : tema.palette.primary.main,
}}

                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Miembros del Equipo */}
      <Typography variant="h4" component="h2" gutterBottom mb={4}>
        Nuestro Equipo
      </Typography>
<Grid container spacing={4}> {miembros.map((miembro, index) => ( <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}> <Card
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: tema.shadows[8]
          }
        }}
      >
        {/* Foto del miembro */}
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <CardMedia
            component="img"
            image={miembro.foto || "/default-avatar.png"}
            alt={miembro.nombre}
            sx={{
              width: 120,
              height: 120,
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
              top: 16,
              right: 16,
              bgcolor: miembro.color,
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
            {miembro.nombre}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: '0.875rem', mb: 2 }}
          >
            {miembro.rol}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            {miembro.descripcion.map((item, idx) => (
              <Box key={idx} display="flex" alignItems="flex-start">
                <Box 
                  sx={{ 
                    minWidth: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: miembro.color,
                    mt: 0.75,
                    mr: 1.5 
                  }} 
                />
                <Typography variant="body2" fontSize="0.8rem">
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


      {/* Tabla de Resumen (Opcional) */}
     
<Paper
  elevation={2}
  sx={{
    backgroundColor: tema.palette.background.paper,
  }}
>
  <Typography variant="h6" gutterBottom fontWeight="bold">
    Resumen de Roles y Responsabilidades
  </Typography>

  <Box sx={{ overflowX: 'auto' }}>
    <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
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
  }}
>
            Nombre
          </TableCell>
<TableCell
  sx={{
    fontWeight: 'bold',
    color: tema.palette.text.primary,
    borderBottom: `2px solid ${tema.palette.divider}`,
  }}
>
            Rol Principal
          </TableCell>
<TableCell
  sx={{
    fontWeight: 'bold',
    color: tema.palette.text.primary,
    borderBottom: `2px solid ${tema.palette.divider}`,
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
            <TableCell sx={{ fontWeight: 'bold', padding: '12px' }}>
              {miembro.nombre}
            </TableCell>
            <TableCell sx={{ padding: '12px' }}>
              {miembro.rol}
            </TableCell>
            <TableCell sx={{ padding: '12px' }}>
              <Stack spacing={0.5}>
                {miembro.descripcion.map((item, idx) => (
                  <Typography key={idx} variant="body2">
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

      {/* Sección de Contacto/Colaboración */}
      <Box 
        sx={{ 
          mt: 8, 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
bgcolor:
  tema.palette.mode === 'dark'
    ? alpha(tema.palette.primary.main, 0.15)
    : alpha(tema.palette.primary.main, 0.05),
          border: `1px solid ${alpha(tema.palette.primary.main, 0.2)}`
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          ¿Interesado en Colaborar?
        </Typography>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Este proyecto está en constante desarrollo. Si eres profesional de la salud, 
          desarrollador o investigador y quieres contribuir, no dudes en contactarnos.
        </Typography>
      </Box>
    </Container>
  );
}