# backend/controladores/personaController.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import logging
import hashlib
from middleware.auth import AuthMiddleware, security
from config.conexion import get_supabase
from datetime import datetime

router = APIRouter(prefix="/persona", tags=["Persona"])

# Modelos
class UpdatePersonaRequest(BaseModel):
    nombre_completo: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

# Función para hashear contrasenhas
def hash_password(password: str) -> str:
    """Hashear contrasenha usando SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

@router.get("/perfil")
async def obtener_perfil(request: Request):
    """Obtener perfil de la persona autenticada"""
    try:
        if not hasattr(request.state, 'persona'):
            raise HTTPException(
                status_code=401,
                detail="No autenticado"
            )
        
        # No devolver la contrasenha en la respuesta
        persona_data = request.state.persona.copy()
        if 'contrasenha' in persona_data:
            del persona_data['contrasenha']
        
        return {
            "success": True,
            "data": {
                "persona": persona_data
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error obteniendo perfil: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error obteniendo perfil"
        )

@router.put("/perfil")
async def actualizar_perfil(request: Request, update_data: UpdatePersonaRequest):
    """Actualizar perfil de la persona"""
    try:
        if not hasattr(request.state, 'persona'):
            raise HTTPException(
                status_code=401,
                detail="No autenticado"
            )
        
        persona_id = request.state.persona.get("id")
        supabase = get_supabase()
        
        # Preparar datos para actualizar
        update_fields = {}
        if update_data.nombre_completo:
            update_fields["nombre_completo"] = update_data.nombre_completo
        if update_data.telefono:
            update_fields["telefono"] = update_data.telefono
        if update_data.direccion:
            update_fields["direccion"] = update_data.direccion
        
        update_fields["fecha_actualizacion"] = datetime.now().isoformat()
        
        # Actualizar en Supabase
        response = supabase.table("persona").update(update_fields).eq("id", persona_id).execute()
        
        if hasattr(response, 'error') and response.error:
            raise HTTPException(
                status_code=400,
                detail=f"Error actualizando perfil: {response.error.message}"
            )
        
        # Actualizar persona en request state
        updated_persona = {**request.state.persona, **update_fields}
        request.state.persona = updated_persona
        
        # No devolver la contrasenha en la respuesta
        if 'contrasenha' in updated_persona:
            del updated_persona['contrasenha']
        
        return {
            "success": True,
            "message": "Perfil actualizado exitosamente",
            "data": updated_persona
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error actualizando perfil: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error actualizando perfil"
        )

@router.put("/cambiar-contrasena")
async def cambiar_contrasena(request: Request, password_data: ChangePasswordRequest):
    """Cambiar contrasenha de la persona"""
    try:
        if not hasattr(request.state, 'persona'):
            raise HTTPException(
                status_code=401,
                detail="No autenticado"
            )
        
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Las nuevas contrasenhas no coinciden"
            )
        
        persona_id = request.state.persona.get("id")
        supabase = get_supabase()
        
        # Obtener la persona actual para verificar contrasenha
        response = supabase.table("persona").select("*").eq("id", persona_id).single().execute()
        
        if hasattr(response, 'error') or not response.data:
            raise HTTPException(
                status_code=404,
                detail="Persona no encontrada"
            )
        
        persona = response.data
        
        # Verificar contrasenha actual
        current_hashed = hash_password(password_data.current_password)
        if persona.get("contrasenha") != current_hashed:
            raise HTTPException(
                status_code=400,
                detail="Contrasenha actual incorrecta"
            )
        
        # Hashear nueva contrasenha
        new_hashed = hash_password(password_data.new_password)
        
        # Actualizar contrasenha
        update_response = supabase.table("persona").update({
            "contrasenha": new_hashed,
            "fecha_actualizacion": datetime.now().isoformat()
        }).eq("id", persona_id).execute()
        
        if hasattr(update_response, 'error') and update_response.error:
            raise HTTPException(
                status_code=400,
                detail=f"Error cambiando contrasenha: {update_response.error.message}"
            )
        
        return {
            "success": True,
            "message": "Contrasenha cambiada exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error cambiando contrasenha: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error cambiando contrasenha"
        )