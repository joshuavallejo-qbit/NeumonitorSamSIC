# backend/app.py 
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import tensorflow as tf
import os
import uuid
from datetime import datetime
from fastapi.responses import JSONResponse

# Supabase y controladores
from config.conexion import (
    get_supabase,
    get_supabase_admin,
    verificar_conexion,
    verificar_storage
)
from controladores import authController, personaController, analisisController


# APP

app = FastAPI(title="API de Detección de Neumonía")


# CORS

def get_origins():
    env = os.getenv("NODE_ENV", "development")
    if env == "production":
        return [
            "https://neumonitor2.vercel.app",
            "https://neumonitor2.onrender.com",
        ]
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


# MIDDLEWARE GLOBAL

@app.middleware("http")
async def middleware_global(request: Request, call_next):
    print(f"\n{'='*50}")
    print(f"Solicitud: {request.method} {request.url.path}")

    if request.method == "OPTIONS":
        response = JSONResponse(content={"message": "OK"})
    else:
        try:
            auth_header = request.headers.get("Authorization")
            request.state.persona = None

            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                supabase = get_supabase()
                response_db = (
                    supabase.table("persona")
                    .select("*")
                    .eq("id", token)
                    .single()
                    .execute()
                )
                if response_db.data:
                    request.state.persona = response_db.data
                    print(f"Usuario autenticado: {response_db.data.get('email')}")
                else:
                    print("Token inválido")
            else:
                print("No hay token en la solicitud")
        except Exception as e:
            print(f"Error en middleware: {e}")

        response = await call_next(request)

    origin = request.headers.get("origin", "")
    if origin in get_origins():
        response.headers["Access-Control-Allow-Origin"] = origin

    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"

    return response

@app.options("/{path:path}")
async def options_handler():
    return {"message": "OK"}


# ROUTERS

app.include_router(authController.router)
app.include_router(personaController.router)
app.include_router(analisisController.router)


# CARGA MODELO IA

modelo = None
try:
    for ruta in [
        "modelo_neumonia_MobileNet.keras",
        "./backend/modelo_neumonia_MobileNet.keras",
        "../backend/modelo_neumonia_MobileNet.keras",
    ]:
        if os.path.exists(ruta):
            modelo = keras.models.load_model(ruta)
            print(f"Modelo cargado desde: {ruta}")
            break
except Exception as e:
    print(f"Error cargando modelo: {e}")


# ENDPOINTS PÚBLICOS

@app.get("/")
async def raiz():
    return {
        "mensaje": "API de Detección de Neumonía",
        "version": "1.1.0",
        "estado": "operativo" if modelo else "modelo no cargado",
        "nuevas_funcionalidades": {
            "registro_mejorado": True,
            "evaluacion_vulnerabilidad": True,
            "analisis_con_impacto_social": True
        }
    }

@app.get("/salud")
async def verificar_salud():
    return {
        "estado": "saludable",
        "modelo_cargado": modelo is not None,
        "supabase_conectado": await verificar_conexion(),
        "storage_disponible": await verificar_storage(),
    }


# NUEVO: VULNERABILIDAD

@app.get("/vulnerabilidad/{persona_id}")
async def obtener_vulnerabilidad(persona_id: str):
    try:
        supabase = get_supabase()
        response = (
            supabase.table("perfil_salud")
            .select("*")
            .eq("persona_id", persona_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")

        perfil = response.data[0]

        return {
            "success": True,
            "data": {
                "nivel_vulnerabilidad": perfil.get("nivel_vulnerabilidad"),
                "prioridad_atencion": perfil.get("prioridad_atencion"),
                "explicacion": perfil.get("explicacion_vulnerabilidad"),
                "perfil_completo": perfil,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# PREDICCIÓN IA
@app.post("/predecir")
async def predecir_neumonia_publico(
    imagen: UploadFile = File(...),
    request: Request = None
):
    if modelo is None:
        raise HTTPException(status_code=500, detail="Modelo no disponible")

    if imagen.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Formato no soportado")

    try:
        contenido = await imagen.read()
        img = Image.open(io.BytesIO(contenido)).convert("RGB").resize((224, 224))
        arr = keras.preprocessing.image.img_to_array(img)
        arr = np.expand_dims(arr, axis=0)

        pred = modelo.predict(arr, verbose=0)[0]
        prob = tf.nn.softmax(pred).numpy()

        clases = ["NORMAL", "PNEUMONIA"]
        idx = int(np.argmax(prob))

        resultado = {
            "diagnostico": clases[idx],
            "confianza": round(float(prob[idx] * 100), 2),
            "probabilidades": {
                "normal": float(prob[0]),
                "neumonia": float(prob[1]),
            },
            "autenticado": False,
            "explicacion": "Análisis estándar sin perfil de salud"
        }

        # Guardar si hay sesión
        if hasattr(request.state, 'persona') and request.state.persona:
            supabase = get_supabase_admin()
            persona_id = request.state.persona["id"]
            nombre_archivo = f"{persona_id}/{uuid.uuid4()}.jpg"

            # Subir imagen
            supabase.storage.from_("radiografias").upload(
                nombre_archivo,
                contenido,
                {"content-type": imagen.content_type},
            )

            url = supabase.storage.from_("radiografias").get_public_url(nombre_archivo)

            # Obtener información de vulnerabilidad
            from controladores.analisisController import obtener_informacion_vulnerabilidad
            vulnerabilidad_info = await obtener_informacion_vulnerabilidad(persona_id, supabase)
            
            # Generar explicación personalizada
            from controladores.analisisController import generar_explicacion_analisis
            explicacion_info = generar_explicacion_analisis(
                resultado["diagnostico"],
                resultado["confianza"],
                vulnerabilidad_info
            )
            
            # Insertar análisis con vulnerabilidad
            analisis_data = {
                "id": str(uuid.uuid4()),
                "persona_id": persona_id,
                "imagen_url": url,
                "diagnostico": resultado["diagnostico"],
                "confianza": resultado["confianza"],
                "probabilidades": resultado["probabilidades"],
                "fecha": datetime.now().isoformat(),
                "nivel_vulnerabilidad_paciente": vulnerabilidad_info["nivel_vulnerabilidad"],
                "prioridad_atencion_sugerida": vulnerabilidad_info["prioridad_atencion"],
                "explicacion_vulnerabilidad": vulnerabilidad_info["explicacion"],
                "detalles_analisis": explicacion_info["explicacion_detallada"]
            }

            supabase.table("analisis_radiografias").insert(analisis_data).execute()

            resultado["autenticado"] = True
            resultado["mensaje"] = "Análisis guardado en historial"
            resultado["explicacion"] = explicacion_info["mensaje_corto"]
            resultado["vulnerabilidad"] = {
                "nivel": vulnerabilidad_info["nivel_vulnerabilidad"],
                "prioridad": vulnerabilidad_info["prioridad_atencion"],
                "explicacion": vulnerabilidad_info["explicacion"]
            }

        return JSONResponse(content=resultado)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


# MAIN

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
