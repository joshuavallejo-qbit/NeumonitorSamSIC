# backend/app.py - Versión simplificada para depuración
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import tensorflow as tf
import os
from typing import Optional
import uuid
from datetime import datetime
from fastapi.responses import JSONResponse

# Importar módulos
from config.conexion import get_supabase, verificar_conexion, verificar_storage, get_supabase_admin
from controladores import authController, personaController, analisisController

app = FastAPI(title="API de Detección de Neumonía")

# Configurar CORS
# Determinar orígenes dinámicamente
def get_origins():
    env = os.getenv("NODE_ENV", "development")
    
    if env == "production":
        return [
            "https://neumonitor2.vercel.app",
            "https://neumonitor2.onrender.com",
        ]
    else:
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# Importar middleware después de crear la app
from middleware.auth import AuthMiddleware
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    
    # Agregar headers CORS
    response.headers["Access-Control-Allow-Origin"] = "https://neumonitor2.vercel.app"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
    
    return response

# Agrega este endpoint específico para OPTIONS
@app.options("/{path:path}")
async def options_handler():
    return {"message": "OK"}
# Crear un middleware HTTP personalizado que SI funcione
@app.middleware("http")
async def middleware_global(request: Request, call_next):
    print(f"\n{'='*50}")
    print(f"Solicitud: {request.method} {request.url.path}")
    
    # Para OPTIONS requests (preflight), responder rápido
    if request.method == "OPTIONS":
        response = JSONResponse(content={"message": "OK"})
    else:
        # Solo verificar autenticación para métodos no-OPTIONS
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                print(f"Token recibido: {token}")
                
                # Verificar formato UUID
                import re
                if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', token):
                    supabase = get_supabase()
                    response_db = supabase.table("persona").select("*").eq("id", token).single().execute()
                    
                    if not hasattr(response_db, 'error') and response_db.data:
                        request.state.persona = response_db.data
                        print(f"Usuario autenticado: {response_db.data.get('email')}")
                    else:
                        request.state.persona = None
                        print("Token no válido o usuario no encontrado")
                else:
                    request.state.persona = None
                    print("Formato de token incorrecto")
            else:
                request.state.persona = None
                print("No hay token en la solicitud")
        except Exception as e:
            print(f"Error en middleware: {e}")
            request.state.persona = None
        
        response = await call_next(request)
    
    # Headers CORS dinámicos
    origin = request.headers.get("origin", "")
    if origin in get_origins():
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
    
    return response
# Incluir routers
app.include_router(authController.router)
app.include_router(personaController.router)
app.include_router(analisisController.router)

# Cargar el modelo de IA
try:
    rutas_modelo = [
        'modelo_neumonia_MobileNet.keras',
        '../backend/modelo_neumonia_MobileNet.keras',
        './backend/modelo_neumonia_MobileNet.keras'
    ]
    
    modelo = None
    for ruta in rutas_modelo:
        try:
            if os.path.exists(ruta):
                modelo = keras.models.load_model(ruta)
                print(f"Modelo cargado exitosamente desde: {ruta}")
                break
        except Exception as e:
            print(f"Error cargando modelo desde {ruta}: {e}")
            continue
            
except Exception as e:
    print(f"Error crítico cargando el modelo: {e}")
    modelo = None

# Rutas públicas
@app.get("/")
async def raiz():
    return {
        "mensaje": "API de Detección de Neumonía",
        "version": "1.0.0",
        "estado": "operativo" if modelo else "modelo no cargado"
    }

@app.get("/salud")
async def verificar_salud():
    conexion_ok = await verificar_conexion()
    storage_ok = await verificar_storage()
    
    return {
        "estado": "saludable", 
        "modelo_cargado": modelo is not None,
        "supabase_conectado": conexion_ok,
        "storage_disponible": storage_ok
    }

# Ruta pública para análisis sin autenticación
@app.post("/predecir")
async def predecir_neumonia_publico(
    imagen: UploadFile = File(...),
    request: Request = None
):
    """Análisis público (sin autenticación requerida) o privado si hay token"""
    print(f"Análisis - Recibiendo imagen: {imagen.filename}")
    
    if modelo is None:
        raise HTTPException(status_code=500, detail="Modelo no disponible")
    
    if imagen.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail=f"Formato de imagen no soportado: {imagen.content_type}")
    
    try:
        # Leer imagen
        contenido = await imagen.read()
        imagen_pil = Image.open(io.BytesIO(contenido))
        
        # Preprocesar
        tamano = (224, 224)
        imagen_pil = imagen_pil.resize(tamano, Image.Resampling.LANCZOS)
        if imagen_pil.mode != 'RGB':
            imagen_pil = imagen_pil.convert('RGB')
        
        # Convertir a array y predecir
        array_imagen = keras.preprocessing.image.img_to_array(imagen_pil)
        array_imagen = np.expand_dims(array_imagen, axis=0)
        predicciones = modelo.predict(array_imagen, verbose=0)
        puntuacion = tf.nn.softmax(predicciones[0])
        puntuacion_numpy = puntuacion.numpy()
        
        nombres_clases = ['NORMAL', 'PNEUMONIA']
        clase_index = int(np.argmax(puntuacion_numpy))
        clase_predicha = nombres_clases[clase_index]
        confianza = float(np.max(puntuacion_numpy) * 100)
        
        resultado = {
            "diagnostico": clase_predicha,
            "confianza": round(confianza, 2),
            "clase_index": clase_index,
            "probabilidades": {
                "normal": float(puntuacion_numpy[0]),
                "neumonia": float(puntuacion_numpy[1])
            },
            "autenticado": False
        }
        
        # Guardar análisis si hay autenticación
        if hasattr(request.state, 'persona') and request.state.persona:
            persona_id = request.state.persona.get("id")
            resultado["autenticado"] = True
            
            try:
                supabase = get_supabase_admin()
                file_extension = imagen.filename.split('.')[-1] if '.' in imagen.filename else 'jpg'
                unique_filename = f"{persona_id}/{uuid.uuid4()}.{file_extension}"
                
                upload_response = supabase.storage.from_("radiografias").upload(
                    unique_filename, contenido, {"content-type": imagen.content_type}
                )
                
                if not hasattr(upload_response, 'error') or not upload_response.error:
                    url_response = supabase.storage.from_("radiografias").get_public_url(unique_filename)
                    analisis_data = {
                        "id": str(uuid.uuid4()),
                        "persona_id": persona_id,
                        "imagen_url": url_response,
                        "diagnostico": clase_predicha,
                        "confianza": confianza,
                        "comentarios": "Análisis desde endpoint",
                        "fecha": datetime.now().isoformat(),
                        "probabilidades": resultado["probabilidades"]
                    }
                    supabase.table("analisis_radiografias").insert(analisis_data).execute()
                    resultado["mensaje"] = "Análisis guardado en tu historial"
                    resultado["analisis_id"] = analisis_data["id"]
            except Exception as save_error:
                print(f"Error guardando análisis autenticado: {save_error}")
        
        # Crear respuesta JSON y agregar headers CORS manualmente
        response = JSONResponse(content=resultado)
        response.headers["Access-Control-Allow-Origin"] = "https://neumonitor2.vercel.app"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response
        
    except Exception as e:
        import traceback
        print(f"Error procesando imagen: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
