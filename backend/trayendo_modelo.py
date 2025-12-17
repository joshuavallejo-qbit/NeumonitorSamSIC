import os
import gdown
import tensorflow as tf

# ============================
# RUTA SEGURA (MISMA CARPETA backend/)
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_NAME = "modelo_neumonia_MobileNet.keras"
MODEL_PATH = os.path.join(BASE_DIR, MODEL_NAME)

# ============================
# GOOGLE DRIVE
# ============================
GOOGLE_DRIVE_URL = (
    "https://drive.google.com/file/d/"
    "14pZcLv1Vl7FECmgn1k_fu-xf-juOh2B6/view?usp=sharing"
)

# ============================
# DESCARGA AUTOMÁTICA
# ============================
if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1_000_000:
    print("📥 Modelo no encontrado o incompleto. Descargando...")
    gdown.download(
        GOOGLE_DRIVE_URL,
        MODEL_PATH,
        quiet=False,
        fuzzy=True  # 🔥 IMPORTANTE PARA DRIVE
    )
    print("✅ Modelo descargado correctamente")
else:
    print("📦 Modelo ya existe y es válido")

# ============================
# CARGA DEL MODELO
# ============================
print("🧠 Cargando modelo...")
model = tf.keras.models.load_model(MODEL_PATH)
print("🚀 Modelo listo")
