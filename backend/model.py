import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
import os

# ============================
# CONFIGURACIÓN DE RUTAS
# Ajusta esta ruta a donde tengas tu carpeta en la laptop
# Ejemplo: "C:/Users/TuUsuario/Datasets/ChestXRay/train"
#data_dir = r'C:/Users/Joshua Vallejo/OneDrive/Club de Inteligencia Artificial Politecnico/App Neumonia CIAP/chest_xray/train'
# ============================
train_dir = r'../chest_xray/train'
val_dir = r'../chest_xray/val'
test_dir = r'../chest_xray/test'


batch_size = 32
img_height = 224   # MobileNetV2 requiere 224x224
img_width = 224

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

class_names = train_ds.class_names
num_classes = len(class_names)
print(f"Clases encontradas: {class_names}")

# ============================
# OPTIMIZACIÓN DEL PIPELINE
# ============================
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# ============================
# DATA AUGMENTATION
# ============================
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.2),
    layers.RandomBrightness(0.2)
])

# ============================
# TRANSFER LEARNING: MobileNetV2
# ============================
base_model = MobileNetV2(
    input_shape=(img_height, img_width, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False  # congelar capas

# ============================
# MODELO FINAL
# ============================
inputs = layers.Input(shape=(img_height, img_width, 3))
x = data_augmentation(inputs)
x = layers.Rescaling(1./255)(x)

x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)

outputs = layers.Dense(num_classes, activation='softmax')(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ============================
# CALLBACKS (ANTI-SOBREAJUSTE)
# ============================
callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=4,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        patience=2,
        factor=0.3
    )
]

# ============================
# ENTRENAMIENTO
# ============================
epochs = 20
print(f"Iniciando entrenamiento por {epochs} épocas...")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=epochs,
    callbacks=callbacks
)

print("¡Entrenamiento finalizado!")

# ============================
# GRÁFICAS DE ENTRENAMIENTO
# ============================
acc = history.history['accuracy']
val_acc = history.history.get('val_accuracy')

loss = history.history['loss']
val_loss = history.history.get('val_loss')

epochs_range = range(len(acc))

plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Entrenamiento')
plt.plot(epochs_range, val_acc, label='Validación')
plt.legend()
plt.title('Precisión (Accuracy)')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Entrenamiento')
plt.plot(epochs_range, val_loss, label='Validación')
plt.legend()
plt.title('Pérdida (Loss)')

plt.show()

# ============================
# GUARDAR MODELO
# ============================
model.save('modelo_neumonia_MobileNet.keras')
print("¡Modelo guardado exitosamente!")

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
