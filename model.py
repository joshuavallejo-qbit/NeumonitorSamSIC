import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import os

# ============================
# CONFIGURACIÓN DE RUTAS
# Ajusta esta ruta a donde tengas tu carpeta en la laptop
# Ejemplo: "C:/Users/TuUsuario/Datasets/ChestXRay/train"
#data_dir = r'C:/Users/Joshua Vallejo/OneDrive/Club de Inteligencia Artificial Politecnico/App Neumonia CIAP/chest_xray/train'
# ============================
train_dir = r'./chest_xray/train'
val_dir = r'./chest_xray/val'
test_dir = r'./chest_xray/test'

batch_size = 32
img_height = 180
img_width = 180

# ============================
# CARGA DEL DATASET
# ============================
print("Cargando set de entrenamiento...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    train_dir,
    seed=123,
    label_mode='int',
    image_size=(img_height, img_width),
    batch_size=batch_size,
    shuffle=True
)

print("Cargando set de validación...")
val_ds = tf.keras.utils.image_dataset_from_directory(
    val_dir,
    seed=123,
    label_mode='int',
    image_size=(img_height, img_width),
    batch_size=batch_size,
    shuffle=False
)

# Mostrar clases
class_names = train_ds.class_names
print(f"\nClases encontradas: {class_names}")

# ============================
# OPTIMIZACIÓN DEL PIPELINE
# ============================
AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

print("¡Flujo de datos optimizado!")

num_classes = len(class_names)

# ============================
# ARQUITECTURA DEL MODELO CNN
# ============================
model = models.Sequential([
    layers.Rescaling(1./255, input_shape=(img_height, img_width, 3)),

    layers.Conv2D(16, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),

    layers.Conv2D(32, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),

    layers.Conv2D(64, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),

    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(num_classes)
])

model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

model.summary()

# ============================
# ENTRENAMIENTO
# ============================
epochs = 10
print(f"Iniciando entrenamiento por {epochs} épocas...")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=epochs
)

print("¡Entrenamiento finalizado!")

# ============================
# GRÁFICAS DE ENTRENAMIENTO
# ============================
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']

loss = history.history['loss']
val_loss = history.history['val_loss']

epochs_range = range(epochs)

plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Entrenamiento')
plt.plot(epochs_range, val_acc, label='Validación')
plt.legend(loc='lower right')
plt.title('Precisión (Accuracy)')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Entrenamiento')
plt.plot(epochs_range, val_loss, label='Validación')
plt.legend(loc='upper right')
plt.title('Pérdida (Loss)')
plt.show()

# ============================
# GUARDAR MODELO
# ============================
model.save('modelo_neumonia.keras')
print("¡Modelo guardado exitosamente como 'modelo_neumonia.keras'!")
# ============================
# EVALUACIÓN EN TEST SET
# ============================
print("\nCargando TEST SET...")
test_ds = tf.keras.utils.image_dataset_from_directory(
    test_dir,
    label_mode='int',
    image_size=(img_height, img_width),
    batch_size=batch_size,
    shuffle=False
)

test_loss, test_acc = model.evaluate(test_ds)
print("\nResultados en TEST:")
print("Test accuracy:", test_acc)
print("Test loss:", test_loss)
