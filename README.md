# Neumonitor -- Sistema Web de Detección Automática de Neumonía mediante IA
Equipo NeumoScanners - Samsung Innovation Campus
##  Cómo usar este proyecto en tu computadora local

Para ejecutar este proyecto en tu entorno local con **Visual Studio
Code** clonar este repositorio, sigue estos pasos:

### 1. Instalar las dependencias necesarias

Asegúrate de tener Python instalado. Luego, ejecuta en la terminal:

``` bash
pip install streamlit
pip install tensorflow
pip install pillow
pip install numpy
```

### 2. Ejecutar el modelo (solo si es necesario entrenar o generar el archivo del modelo)

``` bash
python model.py
```

### 3. Iniciar la aplicación web con Streamlit

Ubicado dentro del directorio del proyecto:

``` bash
streamlit run app.py
```

Esto abrirá automáticamente la interfaz web en tu navegador.

### 4. Descargar el archivo dataset del Kaggle 
https://www.kaggle.com/code/madz2000/pneumonia-detection-using-cnn-92-6-accuracy 
Usted tendrá que descomprimir la carpeta chest_array ya que ahí están las tres carpetas necesarias para este proyecto
![alt text](image.png)
Se recomienda la siguiente estructura de proyecto en su visual studio code:
![alt text](image-1.png)
## Integrantes del equipo y roles

  --------
  Nombre                                                       Rol
  ------------------------------------------------------------ -------------------
  **John Villacís Ramón**                                      Specialist en
                                                               dataset &
                                                               preprocesamiento.
                                                               Encargado de
                                                               recopilar, depurar
                                                               y estandarizar el
                                                               dataset de
                                                               radiografías,
                                                               además de generar
                                                               imágenes
                                                               aumentadas.

  **Joshua Vallejo Luna**                                      Machine Learning
                                                               Engineer. Entrena,
                                                               evalúa y optimiza
                                                               el modelo CNN
                                                               encargado de la
                                                               detección de
                                                               neumonía. Supervisa
                                                               métricas e
                                                               hiperparámetros.

  **Juan Larrea Martínez**                                     Backend & API
                                                               Developer.
                                                               Implementa la API
                                                               de predicción
                                                               (Flask/FastAPI),
                                                               manejo de imágenes
                                                               y comunicación
                                                               entre modelo y
                                                               frontend.

  **Joshúa Castillo Merejildo**                                Frontend Developer.
                                                               Diseña e implementa
                                                               la interfaz web, la
                                                               experiencia del
                                                               usuario y la
                                                               visualización de
                                                               resultados.

  **Brithany Suárez Palacios**                                 Documentation &
                                                               Communication
                                                               Analyst.
                                                               Responsable de la
                                                               documentación
                                                               técnica, redacción
                                                               y presentación del
                                                               proyecto.
  --------



## Nombre de la prueba

**Neumonitor -- Sistema web de detección automática de neumonía mediante
inteligencia artificial**



## Descripción de la prueba

### Prototipo

Un sistema web capaz de recibir imágenes de radiografías de tórax y
procesarlas mediante un modelo basado en redes neuronales
convolucionales (CNN). El modelo clasifica la imagen como:

-   **Normal**, o\
-   **Neumonía**,

acompañado de una probabilidad asociada.

### Propósito del prototipo

El sistema busca apoyar el proceso de evaluación médica inicial en
centros donde:

-   existe escasez de especialistas,
-   hay carga laboral elevada,
-   o los patrones radiológicos son difíciles de interpretar.

La neumonía es una de las principales causas de hospitalización y
mortalidad, especialmente en niños y adultos mayores. Una herramienta de
apoyo basada en IA puede:

-   acelerar la priorización de casos,
-   mejorar la eficiencia del diagnóstico,
-   y reducir errores derivados del cansancio o exceso de trabajo.

### Funcionamiento general

La plataforma web permite cargar una radiografía. El sistema procesa la
imagen y devuelve:

-   la clasificación (**Normal** / **Neumonía**),
-   la probabilidad,
-   y una visualización sencilla que acompañe el diagnóstico preliminar.

Esta herramienta sirve como apoyo, no como reemplazo del criterio
médico.


