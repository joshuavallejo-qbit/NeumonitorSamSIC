import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps

# --- CONFIGURACIÓN DE LA PÁGINA ---
st.set_page_config(
    page_title="Detector de Neumonía IA",
    page_icon="🫁",
    layout="centered"
)

# --- TÍTULO Y DESCRIPCIÓN ---
st.title("🫁 Detector de Neumonía por Rayos X")
st.write("""
Esta aplicación utiliza una **Red Neuronal Convolucional (CNN)** para analizar 
radiografías de tórax y detectar signos de neumonía.
***
¡Sube una imagen para comenzar el diagnóstico!
""")

# --- FUNCIÓN PARA CARGAR EL MODELO (CON CACHÉ) ---
# Usamos @st.cache_resource para que el modelo se cargue una sola vez
# al iniciar la app, y no cada vez que subes una foto (esto lo hace rápido).
@st.cache_resource
def load_model():
    # Asegúrate de que el nombre del archivo coincida exactamente
    model = tf.keras.models.load_model('../backend/modelo_neumonia_MobileNet.keras')
    return model

# Cargamos el modelo y mostramos un mensaje cuando esté listo
with st.spinner('Cargando el cerebro de la IA...'):
    model = load_model()
st.success("¡Modelo de IA cargado y listo!")


# --- WIDGET PARA SUBIR ARCHIVOS ---
uploaded_file = st.file_uploader("Elige una radiografía (formato JPG o PNG)...", type=["jpg", "jpeg", "png"])

# --- LÓGICA DE PREDICCIÓN ---
if uploaded_file is not None:
    # 1. Mostrar la imagen subida
    image = Image.open(uploaded_file)
    st.image(image, caption='Radiografía cargada', width=600)
    
    st.write("Analizando imagen...")

    # 2. Preprocesar la imagen para la IA
    # IMPORTANTE: Debe ser del mismo tamaño que usamos al entrenar (180x180)
    img_height = 224
    img_width = 224
    
    # Convertir a RGB por si acaso es una imagen en escala de grises pura
    image = ImageOps.fit(image, (img_width, img_height), Image.Resampling.LANCZOS)
    image = image.convert('RGB') 
    
    # Convertir a un array de números que entiende TensorFlow
    img_array = tf.keras.preprocessing.image.img_to_array(image)
    # Crear un lote de una sola imagen (batch size = 1)
    img_array = tf.expand_dims(img_array, 0)

    # 3. Realizar la predicción
    predictions = model.predict(img_array)
    score = tf.nn.softmax(predictions[0])

    # Nombres de las clases (en el mismo orden que el entrenamiento)
    class_names = ['NORMAL', 'PNEUMONIA']
    
    predicted_class = class_names[np.argmax(score)]
    confidence = 100 * np.max(score)

    # --- MOSTRAR RESULTADOS CON ESTILO ---
    st.write("---")
    st.header("Resultados del Análisis")

    if predicted_class == 'PNEUMONIA':
        # Mostrar resultado en rojo si es neumonía
        st.error(f"Diagnóstico: **{predicted_class}**")
        st.warning(f"Confianza del modelo: **{confidence:.2f}%**")
        st.write("⚠️ La imagen muestra patrones compatibles con neumonía.")
    else:
        # Mostrar resultado en verde si es normal y lanzar globos
        st.balloons()
        st.success(f"Diagnóstico: **{predicted_class}**")
        st.info(f"Confianza del modelo: **{confidence:.2f}%**")
        st.write("✅ El pulmón parece sano.")