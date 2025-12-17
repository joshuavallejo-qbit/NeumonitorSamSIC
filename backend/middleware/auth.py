# backend/middleware/auth.py - . simplificada que funciona
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from config.conexion import get_supabase
from typing import Optional
import re

security = HTTPBearer(auto_error=False)

class AuthMiddleware:
    """Middleware simplificado de autenticación"""
    
    @staticmethod
    async def verificar_autenticacion(
        request: Request, 
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
    ):
        """Verificar autenticación - . simplificada y funcional"""
        try:
            # Obtener token
            token = credentials.credentials if credentials else None
            
            if not token:
                request.state.persona = None
                return None
            
            # Verificar formato UUID
            if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', token):
                request.state.persona = None
                return None
            
            # Buscar persona en Supabase
            supabase = get_supabase()
            response = supabase.table("persona").select("*").eq("id", token).single().execute()
            
            if hasattr(response, 'error') or not response.data:
                request.state.persona = None
                return None
            
            # Guardar datos de la persona
            persona_data = response.data
            request.state.persona = persona_data
            logging.info(f"Autenticación exitosa para: {persona_data.get('email')}")
            
            return persona_data
            
        except Exception as e:
            logging.error(f"Error en middleware: {str(e)}")
            request.state.persona = None
            return None
    
    @staticmethod
    def proteger():
        """Dependencia para proteger rutas"""
        return Depends(AuthMiddleware.verificar_autenticacion)