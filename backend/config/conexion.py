#backend/config/conexion.py
import os
from supabase import create_client
from dotenv import load_dotenv
import logging

# Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    logging.error("SUPABASE_URL o SUPABASE_ANON_KEY no configuradas")
    raise ValueError("Variables de entorno de Supabase no configuradas")

# Cliente público (sin pasar dict de opciones)
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Cliente admin
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Funciones de utilidad
def get_supabase():
    return supabase

def get_supabase_admin():
    return supabase_admin
async def verificar_conexion():
    """Verificar conexión a Supabase"""
    try:
        response = supabase.table("persona").select("id").limit(1).execute()
        if hasattr(response, "error") and response.error:
            logging.warning(f"Error inicial al consultar tabla persona: {response.error}")
        else:
            logging.info("Conexión a Supabase establecida correctamente")
        return True
    except Exception as e:
        logging.error(f"Error conectando a Supabase: {str(e)}")
        return False

async def verificar_storage():
    """Verificar acceso a Storage"""
    try:
        buckets = supabase.storage.list_buckets()
        logging.info("Storage verificado correctamente")
        return True
    except Exception as e:
        logging.error(f"Error verificando storage: {str(e)}")
        return False