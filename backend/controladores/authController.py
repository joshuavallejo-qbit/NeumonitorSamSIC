# backend/controladores/authController.py 
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
import logging
import hashlib
from datetime import datetime, date
from config.conexion import get_supabase, get_supabase_admin
import uuid

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# Modelos Pydantic
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ExperienciasCovid(BaseModel):
    diagnosticado: bool = False
    hospitalizado: bool = False
    secuelas_respiratorias: bool = False
    perdida_empleo: bool = False
    sin_covid: bool = False

class RegisterRequest(BaseModel):
    # Información básica
    email: EmailStr
    password: str
    nombre_completo: str
    telefono: str = ""
    direccion: str = ""
    
    # Nuevas preguntas de registro
    fecha_nacimiento: date
    tipo_zona: str = Field(..., pattern="^(urbana|periurbana|rural|comunidad_dificil)$")
    situacion_economica: str = Field(
        ..., 
        pattern="^(ingresos_limites|ingresos_moderados|ingresos_estables|prefiero_no_responder)$"
    )
    acceso_salud: str = Field(
        ..., 
        pattern="^(muy_dificil|dificil|acceso_moderado|facil_acceso|atencion_privada)$"
    )
    experiencias_covid: Dict[str, bool] = Field(default_factory=dict)
    
    @validator('experiencias_covid')
    def validate_experiencias_covid(cls, v):
        allowed_keys = [
            'diagnosticado', 'hospitalizado', 'secuelas_respiratorias', 
            'perdida_empleo', 'sin_covid'
        ]
        return {k: bool(v.get(k, False)) for k in allowed_keys}
class RecuperarPasswordRequest(BaseModel):
    email: EmailStr
    nueva_password: str = Field(..., min_length=8)
    confirmar_password: str = Field(..., min_length=8)

# Función para hashear contrasenhas
def hash_password(password: str) -> str:
    """Hashear contrasenha usando SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# Función para calcular vulnerabilidad
def calcular_vulnerabilidad_backend(
    fecha_nacimiento: date,
    tipo_zona: str,
    situacion_economica: str,
    experiencias_covid: Dict[str, bool]
) -> Dict[str, Any]:
    """Calcular nivel de vulnerabilidad basado en los datos del usuario"""
    from datetime import date
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
    
    factores_criticos = 0
    motivos = []
    
    # Edad > 56
    if edad > 56:
        factores_criticos += 1
        motivos.append(f"Edad > 56 años (edad actual: {edad})")
    
    # Zona rural o difícil acceso
    if tipo_zona in ['rural', 'comunidad_dificil']:
        factores_criticos += 1
        motivos.append(f"Zona {tipo_zona}")
    
    # Ingresos limitados
    if situacion_economica == 'ingresos_limites':
        factores_criticos += 1
        motivos.append("Ingresos limitados")
    
    # Hospitalización por COVID-19
    if experiencias_covid.get('hospitalizado'):
        factores_criticos += 1
        motivos.append("Hospitalización por COVID-19")
    
    # Determinar nivel
    if factores_criticos >= 3:
        nivel = "ALTA"
        prioridad = "ALTA"
    elif factores_criticos >= 1:
        nivel = "MEDIA"
        prioridad = "MEDIA"
    else:
        nivel = "BAJA"
        prioridad = "BAJA"
    
    return {
        "nivel_vulnerabilidad": nivel,
        "prioridad_atencion": prioridad,
        "factores_criticos": factores_criticos,
        "motivos": motivos,
        "edad_actual": edad
    }
@router.post("/login")
async def login(request: LoginRequest):
    """Iniciar sesión usando tabla persona"""
    try:
        supabase = get_supabase()
        
        # Buscar persona por email
        response = supabase.table("persona").select("*").eq("email", request.email).execute()

        if hasattr(response, 'error') and response.error:
            logging.error(f"Error buscando usuario: {response.error.message}")
            raise HTTPException(
                status_code=500,
                detail="Error interno del servidor"
            )

        if not response.data or len(response.data) == 0:
            # Usuario no existe
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado, por favor regístrese"
            )

        # Tomar el primer registro
        persona = response.data[0]

        
        # Verificar contraseña
        hashed_password = hash_password(request.password)
        if persona.get("contrasenha") != hashed_password:
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )
        
        # Token = ID de persona
        token = persona.get("id")
        
        return {
            "success": True,
            "message": "Login exitoso",
            "data": {
                "persona": {
                    "id": persona.get("id"),
                    "email": persona.get("email"),
                    "nombre_completo": persona.get("nombre_completo"),
                    "telefono": persona.get("telefono"),
                    "direccion": persona.get("direccion")
                },
                "token": token
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )


@router.post("/registro")
async def registro(request: RegisterRequest):
    """Registrar nueva persona con preguntas de salud"""
    try:
        supabase = get_supabase_admin()
        
        # Verificar si el email ya existe
        check_response = supabase.table("persona").select("email").eq("email", request.email).execute()
        
        if check_response.data and len(check_response.data) > 0:
            raise HTTPException(
                status_code=400,
                detail="El email ya está registrado"
            )
        
        # Hashear contrasenha
        hashed_password = hash_password(request.password)
        
        # Generar ID único
        persona_id = str(uuid.uuid4())
        
        # Crear persona en tabla persona
        persona_data = {
            "id": persona_id,
            "email": request.email,
            "contrasenha": hashed_password,
            "nombre_completo": request.nombre_completo,
            "telefono": request.telefono,
            "direccion": request.direccion,
            "fecha_creacion": datetime.now().isoformat(),
            "fecha_actualizacion": datetime.now().isoformat()
        }
        
        # Insertar persona
        insert_response = supabase.table("persona").insert(persona_data).execute()
        
        if hasattr(insert_response, 'error') and insert_response.error:
            raise HTTPException(
                status_code=400,
                detail=f"Error creando persona: {insert_response.error.message}"
            )
        
        # Calcular vulnerabilidad
        vulnerabilidad = calcular_vulnerabilidad_backend(
            request.fecha_nacimiento,
            request.tipo_zona,
            request.situacion_economica,
            request.experiencias_covid
        )
        
        # Crear perfil de salud
        perfil_salud_data = {
            "persona_id": persona_id,
            "fecha_nacimiento": request.fecha_nacimiento.isoformat(),
            "tipo_zona": request.tipo_zona,
            "situacion_economica": request.situacion_economica,
            "acceso_salud": request.acceso_salud,
            "experiencias_covid": request.experiencias_covid,
            "nivel_vulnerabilidad": vulnerabilidad["nivel_vulnerabilidad"],
            "prioridad_atencion": vulnerabilidad["prioridad_atencion"],
            "fecha_creacion": datetime.now().isoformat(),
            "fecha_actualizacion": datetime.now().isoformat()
        }
        
        # Insertar perfil de salud
        perfil_response = supabase.table("perfil_salud").insert(perfil_salud_data).execute()
        
        if hasattr(perfil_response, 'error') and perfil_response.error:
            logging.warning(f"Error creando perfil salud: {perfil_response.error.message}")
            # No fallar si no se puede crear el perfil, pero registrar el error
        
        # IMPORTANTE: Token es el ID de la persona
        return {
            "success": True,
            "message": "Registro exitoso",
            "data": {
                "persona": {
                    "id": persona_id,
                    "email": request.email,
                    "nombre_completo": request.nombre_completo,
                    "telefono": request.telefono,
                    "direccion": request.direccion
                },
                "perfil_salud": perfil_salud_data,
                "vulnerabilidad": vulnerabilidad,
                "token": persona_id  # Token = ID de persona
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error en registro: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@router.post("/logout")
async def logout():
    """Cerrar sesión"""
    try:
        return {
            "success": True,
            "message": "Sesión cerrada exitosamente"
        }
        
    except Exception as e:
        logging.error(f"Error en logout: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error cerrando sesión"
        )

@router.get("/verificar-sesion")
async def verificar_sesion():
    """Verificar si hay sesión activa (el middleware maneja la autenticación)"""
    try:
        return {
            "success": True,
            "message": "Sesión verificada"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error verificando sesión"
        )
@router.post("/recuperar-password")
async def recuperar_password(request: RecuperarPasswordRequest):
    """Recuperar contraseña directamente usando email y nueva contraseña"""
    try:
        supabase = get_supabase_admin()
        
        # Validar que las contraseñas coincidan
        if request.nueva_password != request.confirmar_password:
            raise HTTPException(
                status_code=400,
                detail="Las contraseñas no coinciden"
            )
        
        # Buscar persona por email sin usar .single()
        response = supabase.table("persona").select("id, email, nombre_completo").eq("email", request.email).execute()
        
        if hasattr(response, 'error') and response.error:
            logging.error(f"Error buscando usuario para recuperación: {response.error.message}")
            raise HTTPException(
                status_code=500,
                detail="Error interno del servidor"
            )

        if not response.data or len(response.data) == 0:
            # Usuario no existe
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado, por favor regístrese"
            )

        # Tomar el primer registro
        persona = response.data[0]
        persona_id = persona.get("id")
        
        # Hashear nueva contraseña
        hashed_password = hash_password(request.nueva_password)
        
        # Actualizar contraseña en la base de datos
        update_response = supabase.table("persona").update({
            "contrasenha": hashed_password,
            "fecha_actualizacion": datetime.now().isoformat()
        }).eq("id", persona_id).execute()
        
        if hasattr(update_response, 'error') and update_response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Error actualizando contraseña: {update_response.error.message}"
            )
        
        logging.info(f"Contraseña recuperada exitosamente para usuario: {request.email}")
        
        return {
            "success": True,
            "message": "Contraseña actualizada exitosamente",
            "data": {
                "email": request.email,
                "nombre_completo": persona.get("nombre_completo")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error en recuperación de contraseña: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
