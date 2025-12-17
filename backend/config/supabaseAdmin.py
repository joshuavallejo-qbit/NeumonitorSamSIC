# backend/config/supabaseAdmin.py
import os
from supabase import create_client
from dotenv import load_dotenv
import logging

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_SERVICE_KEY:
    logging.error("SUPABASE_SERVICE_ROLE_KEY no configurada en .env")
    raise ValueError("Clave de servicio de Supabase no configurada")

# Cliente admin con service_role key
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    "auth": {
        "auto_refresh_token": False,
        "persist_session": False,
        "detect_session_in_url": False
    }
})

def get_admin_client():
    """Obtener cliente admin"""
    return supabase_admin