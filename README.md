# prubas

Esta demo utiliza la cámara del navegador para analizar la tonalidad de tu rostro y, mediante un sencillo modelo de aprendizaje automático, sugerir un tipo de maquillaje.

La clasificación se realiza con un modelo KNN definido en la página utilizando la librería [ml5.js](https://ml5js.org/). Además, se emplea **FaceApi** para detectar el rostro y calcular el color medio únicamente en esa zona. No se almacenan imágenes y la recomendación es únicamente orientativa.

- El modelo ahora detecta el rostro con FaceApi y analiza el tono, saturación y brillo promedio dentro de esa región para afinar la recomendación de maquillaje.
2. Acepta el permiso para usar la cámara.
3. Pulsa **Analizar** para capturar la imagen y recibir la sugerencia generada por el modelo.

La clasificación se realiza con un modelo KNN definido en la página utilizando la librería [ml5.js](https://ml5js.org/). No se almacenan imágenes y la recomendación es únicamente orientativa.

### Novedades

- Interfaz renovada en tonos rosados para un aspecto más profesional y secciones descriptivas.
- El modelo ahora analiza el tono, saturación y brillo promedio de todo el rostro para afinar la recomendación de maquillaje.
Este es un ejemplo sencillo de aplicación web que utiliza la cámara del navegador para ofrecer una recomendación de maquillaje basada en el color promedio del rostro.

## Uso

1. Abre `index.html` en un navegador que permita acceder a la cámara (por ejemplo, Chrome o Firefox).
2. Concede permiso para utilizar la cámara.
3. Pulsa el botón **Analizar** para capturar la imagen actual y recibir una recomendación básica.

La lógica de recomendación es solo demostrativa y se basa en el brillo obtenido de la imagen.
