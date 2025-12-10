import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

# CONFIGURACIÓN BÁSICA
# Ajusta esta ruta a donde tengas tu carpeta en la laptop
# Ejemplo: "C:/Users/TuUsuario/Datasets/ChestXRay/train"
#data_dir = r'C:/Users/Joshua Vallejo/OneDrive/Club de Inteligencia Artificial Politecnico/App Neumonia CIAP/chest_xray/train'
data_dir = r'./chest_xray/train'
batch_size = 32      # Cantidad de imágenes a procesar por lote
img_height = 180     # Redimensionaremos todas las imágenes a este tamaño
img_width = 180

# CARGA DEL DATASET
# Usamos esta función que es muy eficiente para cargar desde carpetas
print("Cargando set de entrenamiento...")
train_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2, # Usamos el 20% para validar mientras entrenamos
  subset="training",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

print("Cargando set de validación...")
val_ds = tf.keras.utils.image_dataset_from_directory(
  data_dir,
  validation_split=0.2,
  subset="validation",
  seed=123,
  image_size=(img_height, img_width),
  batch_size=batch_size)

# Imprimir las clases encontradas
class_names = train_ds.class_names
print(f"\nClases encontradas: {class_names}")

AUTOTUNE = tf.data.AUTOTUNE

# Optimización para el set de entrenamiento
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)

# Optimización para el set de validación
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

print("¡Flujo de datos optimizado!")

num_classes = len(class_names) # Deberían ser 2 (Normal, Pneumonia)

model = models.Sequential([
  # Capa 1: Normalización de entrada
  layers.Rescaling(1./255, input_shape=(img_height, img_width, 3)),
  
  # Bloque Convolucional 1
  layers.Conv2D(16, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  
  # Bloque Convolucional 2
  layers.Conv2D(32, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  
  # Bloque Convolucional 3
  layers.Conv2D(64, 3, padding='same', activation='relu'),
  layers.MaxPooling2D(),
  
  # Clasificación (Cerebro final)
  layers.Flatten(),
  layers.Dense(128, activation='relu'),
  layers.Dense(num_classes) # Salida final (2 neuronas)
])

# COMPILACIÓN DEL MODELO
# Aquí definimos qué "optimizador" usará para aprender (Adam en este caso)
# y cómo medirá su error.
model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

# Ver resumen de la arquitectura
model.summary()

epochs = 10

print(f"Iniciando entrenamiento por {epochs} épocas...")

# Guardamos la historia del entrenamiento para graficarla después
history = model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=epochs
)

print("¡Entrenamiento finalizado!")

acc = history.history['accuracy']
val_acc = history.history['val_accuracy']

loss = history.history['loss']
val_loss = history.history['val_loss']

epochs_range = range(epochs)

plt.figure(figsize=(12, 6))

# Gráfica de Precisión (Accuracy)
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Entrenamiento (Train)')
plt.plot(epochs_range, val_acc, label='Validación (Val)')
plt.legend(loc='lower right')
plt.title('Precisión (Accuracy)')

# Gráfica de Pérdida (Loss)
plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Entrenamiento (Train)')
plt.plot(epochs_range, val_loss, label='Validación (Val)')
plt.legend(loc='upper right')
plt.title('Pérdida (Loss)')
plt.show()

# Guardamos el modelo en formato Keras nativo
model.save('modelo_neumonia.keras')

print("¡Modelo guardado exitosamente como 'modelo_neumonia.keras'!")
