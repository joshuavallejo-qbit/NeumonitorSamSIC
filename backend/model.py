import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
import os
import numpy as np

# CONFIGURACIÓN DE RUTAS

train_dir = r'../chest_xray/train'
val_dir = r'../chest_xray/val'
test_dir = r'../chest_xray/test'

batch_size = 16  # Reducido para mejor aprendizaje
img_height = 224
img_width = 224


# CARGA DEL DATASET

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


# OPTIMIZACIÓN DEL PIPELINE

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)


# DATA AUGMENTATION MEJORADO

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.2),
    layers.RandomContrast(0.25),
    layers.RandomBrightness(0.25),
    layers.RandomTranslation(0.1, 0.1),  # Nuevo: traslación
], name="data_augmentation")


# TRANSFER LEARNING: MobileNetV2

base_model = MobileNetV2(
    input_shape=(img_height, img_width, 3),
    include_top=False,
    weights="imagenet"
)

# CLAVE: Descongelar las últimas capas para fine-tuning
base_model.trainable = False  # Inicialmente congelado


# MODELO FINAL CON MÁS CAPACIDAD

inputs = layers.Input(shape=(img_height, img_width, 3))
x = data_augmentation(inputs)
x = layers.Rescaling(1./255)(x)

x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)

# Capas densas adicionales para mejor aprendizaje
x = layers.Dense(256, activation='relu', name='dense_1')(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.5)(x)

x = layers.Dense(128, activation='relu', name='dense_2')(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.4)(x)

outputs = layers.Dense(num_classes, activation='softmax', name='predictions')(x)

model = models.Model(inputs, outputs)


# COMPILACIÓN INICIAL

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()


# CALLBACKS MEJORADOS

callbacks_phase1 = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        patience=3,
        factor=0.5,
        min_lr=1e-7,
        verbose=1
    ),
    tf.keras.callbacks.ModelCheckpoint(
        'best_model_phase1.keras',
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
]


# FASE 1: ENTRENAMIENTO CON BASE CONGELADA

print("\n" + "="*60)
print("FASE 1: Entrenamiento con MobileNetV2 congelado")
print("="*60)

epochs_phase1 = 15
history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=epochs_phase1,
    callbacks=callbacks_phase1,
    verbose=1
)


# FASE 2: FINE-TUNING

print("\n" + "="*60)
print("FASE 2: Fine-tuning (descongelando últimas capas)")
print("="*60)

# Descongelar las últimas 50 capas de MobileNetV2
base_model.trainable = True
fine_tune_at = len(base_model.layers) - 50

for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

# Recompilar con learning rate MUY bajo
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),  # 10x más bajo
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

callbacks_phase2 = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        patience=2,
        factor=0.5,
        min_lr=1e-8,
        verbose=1
    ),
    tf.keras.callbacks.ModelCheckpoint(
        'best_model_phase2.keras',
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
]

epochs_phase2 = 20
history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=epochs_phase2,
    initial_epoch=history1.epoch[-1],
    callbacks=callbacks_phase2,
    verbose=1
)

print("\n¡Entrenamiento finalizado!")


# COMBINAR HISTORIALES

acc = history1.history['accuracy'] + history2.history['accuracy']
val_acc = history1.history['val_accuracy'] + history2.history['val_accuracy']
loss = history1.history['loss'] + history2.history['loss']
val_loss = history1.history['val_loss'] + history2.history['val_loss']


# GRÁFICAS DE ENTRENAMIENTO

epochs_range = range(len(acc))

plt.figure(figsize=(14, 6))

plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Entrenamiento', linewidth=2)
plt.plot(epochs_range, val_acc, label='Validación', linewidth=2)
plt.axvline(x=epochs_phase1, color='r', linestyle='--', label='Inicio Fine-tuning')
plt.legend(loc='lower right')
plt.title('Precisión (Accuracy)', fontsize=14, fontweight='bold')
plt.xlabel('Época')
plt.ylabel('Accuracy')
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Entrenamiento', linewidth=2)
plt.plot(epochs_range, val_loss, label='Validación', linewidth=2)
plt.axvline(x=epochs_phase1, color='r', linestyle='--', label='Inicio Fine-tuning')
plt.legend(loc='upper right')
plt.title('Pérdida (Loss)', fontsize=14, fontweight='bold')
plt.xlabel('Época')
plt.ylabel('Loss')
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
plt.show()


# EVALUACIÓN DETALLADA EN TEST SET

print("\n" + "="*60)
print("EVALUACIÓN EN TEST SET")
print("="*60)

test_ds = tf.keras.utils.image_dataset_from_directory(
    test_dir,
    label_mode='int',
    image_size=(img_height, img_width),
    batch_size=batch_size,
    shuffle=False
)

test_loss, test_acc = model.evaluate(test_ds, verbose=1)
print(f"\nTest Accuracy: {test_acc*100:.2f}%")
print(f"Test Loss: {test_loss:.4f}")


# ANÁLISIS DE CONFIANZA

print("\n" + "="*60)
print("ANÁLISIS DE CONFIANZA EN PREDICCIONES")
print("="*60)

y_true = []
y_pred_probs = []

for images, labels in test_ds:
    predictions = model.predict(images, verbose=0)
    y_true.extend(labels.numpy())
    y_pred_probs.extend(predictions)

y_pred_probs = np.array(y_pred_probs)
y_pred_classes = np.argmax(y_pred_probs, axis=1)
confidences = np.max(y_pred_probs, axis=1)

print(f"Confianza promedio: {np.mean(confidences)*100:.2f}%")
print(f"Confianza mínima: {np.min(confidences)*100:.2f}%")
print(f"Confianza máxima: {np.max(confidences)*100:.2f}%")
print(f"Predicciones con >90% confianza: {np.sum(confidences > 0.9) / len(confidences) * 100:.2f}%")
print(f"Predicciones con >95% confianza: {np.sum(confidences > 0.95) / len(confidences) * 100:.2f}%")


# MATRIZ DE CONFUSIÓN

from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns

cm = confusion_matrix(y_true, y_pred_classes)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=class_names, yticklabels=class_names,
            cbar_kws={'label': 'Cantidad'})
plt.title('Matriz de Confusión', fontsize=14, fontweight='bold')
plt.ylabel('Etiqueta Real')
plt.xlabel('Predicción')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.show()

print("\nReporte de Clasificación:")
print(classification_report(y_true, y_pred_classes, target_names=class_names))


# GUARDAR MODELO FINAL

model.save('modelo_neumonia_MobileNet.keras')
print("\n. ¡Modelo guardado exitosamente como 'modelo_neumonia_MobileNet.keras'!")
print(f"Accuracy final en test: {test_acc*100:.2f}%")
print(f"Confianza promedio: {np.mean(confidences)*100:.2f}%")
