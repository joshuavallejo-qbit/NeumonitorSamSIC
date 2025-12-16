# backend/controladores/authController.py - Corregido
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import logging
import hashlib
from datetime import datetime
from config.conexion import get_supabase
import uuid
import secrets

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# Modelos Pydantic
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nombre_completo: str
    telefono: str = ""
    direccion: str = ""

# Función para hashear contrasenhas
def hash_password(password: str) -> str:
    """Hashear contrasenha usando SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login")
async def login(request: LoginRequest):
    """Iniciar sesión usando tabla persona"""
    try:
        supabase = get_supabase()
        
        # Buscar persona por email
        response = supabase.table("persona").select("*").eq("email", request.email).single().execute()
        
        if hasattr(response, 'error') or not response.data:
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )
        
        persona = response.data
        
        # Verificar contrasenha
        hashed_password = hash_password(request.password)
        if persona.get("contrasenha") != hashed_password:
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )
        
        # IMPORTANTE: El token es el ID de la persona (UUID)
        # Esto simplifica la verificación en el middleware
        token = persona.get("id")
        
        if not token:
            raise HTTPException(
                status_code=500,
                detail="Error interno del servidor"
            )
        
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
                "token": token  # Token = ID de persona
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
    """Registrar nueva persona en tabla persona"""
    try:
        supabase = get_supabase()
        
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