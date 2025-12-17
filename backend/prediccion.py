import tensorflow as tf
import numpy as np

# 1. Cargar el modelo que acabamos de entrenar
print("Cargando el modelo...")
model = tf.keras.models.load_model('modelo_neumonia_MobileNet.keras')

# 2. Cargar una imagen para probar
# BUSCA UNA IMAGEN EN LA CARPETA 'test' Y PEGA SU RUTA AQUÍ:
# img_path = r"C:/Users/Joshua Vallejo/OneDrive/Club de Inteligencia Artificial Politecnico/App Neumonia CIAP/chest_xray/test/NORMAL/IM-0030-0001.jpeg" 
# Ruta relativa
img_path = r"/chest_xray/test/NORMAL/IM-0030-0001.jpeg" 
img_height = 224
img_width = 224

# Preprocesamos la imagen igual que en el entrenamiento
img = tf.keras.utils.load_img(
    img_path, target_size=(img_height, img_width)
)
img_array = tf.keras.utils.img_to_array(img)
img_array = tf.expand_dims(img_array, 0) # Crear un lote de una sola imagen (batch size = 1)

# 3. Hacemos la predicción
predictions = model.predict(img_array)
score = tf.nn.softmax(predictions[0])

# 4. Mostrar resultado
class_names = ['NORMAL', 'PNEUMONIA'] # Asegúrate que el orden sea el mismo que al entrenar

print(
    "\nDiagnóstico: Esta imagen es {} con un {:.2f}% de confianza."
    .format(class_names[np.argmax(score)], 100 * np.max(score))
)