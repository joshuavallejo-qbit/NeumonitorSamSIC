-- Script SQL para crear las tablas necesarias en Supabase
-- Tabla persona CON campo contraseña

CREATE TABLE IF NOT EXISTS persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    contrasenha TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE persona ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para persona
CREATE POLICY "Personas pueden ver su propio perfil" 
    ON persona FOR SELECT 
    USING (true); -- Temporalmente permitir a todos ver

CREATE POLICY "Personas pueden actualizar su propio perfil" 
    ON persona FOR UPDATE 
    USING (true); -- Temporalmente permitir a todos actualizar

CREATE POLICY "Personas pueden insertar su propio perfil" 
    ON persona FOR INSERT 
    WITH CHECK (true); -- Permitir inserción sin restricciones

-- Tabla de análisis de radiografías
CREATE TABLE IF NOT EXISTS analisis_radiografias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    imagen_url TEXT NOT NULL,
    diagnostico TEXT NOT NULL,
    confianza FLOAT NOT NULL,
    comentarios TEXT,
    fecha TIMESTAMP DEFAULT NOW(),
    probabilidades JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS para análisis
ALTER TABLE analisis_radiografias ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para análisis
CREATE POLICY "Permitir lectura de análisis" 
    ON analisis_radiografias FOR SELECT 
    USING (true); -- Permitir a todos leer
    
CREATE POLICY "Permitir inserción de análisis" 
    ON analisis_radiografias FOR INSERT 
    WITH CHECK (true); -- Permitir a cualquiera insertar


CREATE POLICY "Personas pueden eliminar sus propios análisis" 
    ON analisis_radiografias FOR DELETE 
    USING (true); -- Temporalmente permitir eliminación

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para persona
CREATE TRIGGER update_persona_updated_at 
    BEFORE UPDATE ON persona 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_persona_email ON persona(email);
CREATE INDEX IF NOT EXISTS idx_analisis_persona_id ON analisis_radiografias(persona_id);
CREATE INDEX IF NOT EXISTS idx_analisis_fecha ON analisis_radiografias(fecha DESC);
-- En la sección de políticas del bucket
CREATE POLICY "Permitir subida de archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'radiografias');

