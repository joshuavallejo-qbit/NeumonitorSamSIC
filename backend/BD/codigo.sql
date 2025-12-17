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


-- Tabla para preguntas de registro (información demográfica)
CREATE TABLE IF NOT EXISTS perfil_salud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES persona(id) ON DELETE CASCADE,
    
    -- Información demográfica
    fecha_nacimiento DATE,
    tipo_zona TEXT CHECK (tipo_zona IN ('urbana', 'periurbana', 'rural', 'comunidad_dificil')),
    
    -- Situación económica
    situacion_economica TEXT CHECK (situacion_economica IN (
        'ingresos_limites', 
        'ingresos_moderados', 
        'ingresos_estables', 
        'prefiero_no_responder'
    )),
    
    -- Acceso a servicios de salud
    acceso_salud TEXT CHECK (acceso_salud IN (
        'muy_dificil',
        'dificil',
        'acceso_moderado',
        'facil_acceso',
        'atencion_privada'
    )),
    
    -- Experiencias durante la pandemia (JSONB para múltiples opciones)
    experiencias_covid JSONB DEFAULT '[]',
    
    -- Nivel de vulnerabilidad calculado
    nivel_vulnerabilidad TEXT CHECK (nivel_vulnerabilidad IN ('BAJA', 'MEDIA', 'ALTA')),
    prioridad_atencion TEXT CHECK (prioridad_atencion IN ('BAJA', 'MEDIA', 'ALTA')),
    
    -- Metadatos
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(persona_id)
);


-- Habilitar RLS (Row Level Security)
ALTER TABLE persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_salud ENABLE ROW LEVEL SECURITY;


-- Políticas para perfil_salud
CREATE POLICY "Personas pueden ver su propio perfil_salud" 
    ON perfil_salud FOR SELECT 
    USING (auth.uid() = persona_id);

CREATE POLICY "Personas pueden actualizar su propio perfil_salud" 
    ON perfil_salud FOR UPDATE 
    USING (auth.uid() = persona_id);

CREATE POLICY "Personas pueden insertar su propio perfil_salud" 
    ON perfil_salud FOR INSERT 
    WITH CHECK (auth.uid() = persona_id);


ALTER TABLE analisis_radiografias
ADD COLUMN nivel_vulnerabilidad_paciente TEXT,
ADD COLUMN prioridad_atencion_sugerida TEXT,
ADD COLUMN explicacion_vulnerabilidad TEXT,
ADD COLUMN detalles_analisis TEXT;

ALTER TABLE analisis_radiografias ENABLE ROW LEVEL SECURITY;


-- Políticas de seguridad para análisis
CREATE POLICY "Permitir lectura de análisis" 
    ON analisis_radiografias FOR SELECT 
    USING (auth.uid() = persona_id);
    
CREATE POLICY "Permitir inserción de análisis" 
    ON analisis_radiografias FOR INSERT 
    WITH CHECK (auth.uid() = persona_id);

CREATE POLICY "Personas pueden eliminar sus propios análisis" 
    ON analisis_radiografias FOR DELETE 
    USING (auth.uid() = persona_id);

-- Función para calcular vulnerabilidad
CREATE OR REPLACE FUNCTION calcular_vulnerabilidad(
    p_fecha_nacimiento DATE,
    p_tipo_zona TEXT,
    p_situacion_economica TEXT,
    p_experiencias_covid JSONB
) RETURNS JSON AS $$
DECLARE
    v_edad INT;
    v_factores_criticos INT := 0;
    v_nivel_vulnerabilidad TEXT;
    v_prioridad_atencion TEXT;
    v_motivos TEXT[];
BEGIN
    -- Calcular edad
    v_edad := EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_fecha_nacimiento));
    
    -- Verificar factores de vulnerabilidad
    IF v_edad > 56 THEN
        v_factores_criticos := v_factores_criticos + 1;
        v_motivos := array_append(v_motivos, 'Edad > 56 años (edad: ' || v_edad || ')');
    END IF;
    
    IF p_tipo_zona IN ('rural', 'comunidad_dificil') THEN
        v_factores_criticos := v_factores_criticos + 1;
        v_motivos := array_append(v_motivos, 'Zona ' || p_tipo_zona);
    END IF;
    
    IF p_situacion_economica = 'ingresos_limites' THEN
        v_factores_criticos := v_factores_criticos + 1;
        v_motivos := array_append(v_motivos, 'Ingresos limitados');
    END IF;
    
    -- Verificar experiencias COVID (corregir la verificación)
    IF p_experiencias_covid::text LIKE '%"hospitalizado": true%' THEN
        v_factores_criticos := v_factores_criticos + 1;
        v_motivos := array_append(v_motivos, 'Hospitalización por COVID-19');
    END IF;
    
    -- Determinar nivel de vulnerabilidad
    IF v_factores_criticos >= 3 THEN
        v_nivel_vulnerabilidad := 'ALTA';
        v_prioridad_atencion := 'ALTA';
    ELSIF v_factores_criticos >= 1 THEN
        v_nivel_vulnerabilidad := 'MEDIA';
        v_prioridad_atencion := 'MEDIA';
    ELSE
        v_nivel_vulnerabilidad := 'BAJA';
        v_prioridad_atencion := 'BAJA';
    END IF;
    
    RETURN json_build_object(
        'nivel_vulnerabilidad', v_nivel_vulnerabilidad,
        'prioridad_atencion', v_prioridad_atencion,
        'factores_criticos', v_factores_criticos,
        'motivos', v_motivos,
        'edad_actual', v_edad
    );
END;
$$ LANGUAGE plpgsql;



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

-- Trigger para perfil_salud
CREATE TRIGGER update_perfil_salud_updated_at 
    BEFORE UPDATE ON perfil_salud 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_analisis_fecha ON analisis_radiografias(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_perfil_salud_persona ON perfil_salud(persona_id);

-- Bucket para radiografías
INSERT INTO storage.buckets (id, name, public) 
VALUES ('radiografias', 'radiografias', true)
ON CONFLICT (id) DO NOTHING;
