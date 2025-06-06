# preubas

Esta demo utiliza la cámara del navegador para analizar la tonalidad de tu rostro y, mediante un sencillo modelo de aprendizaje automático, sugerir un tipo de maquillaje.

La cámara solo funciona cuando la página se carga desde un origen seguro. Lo más sencillo es abrir un servidor local o publicar el proyecto en GitHub Pages.

1. Ejecuta `python3 -m http.server` en la carpeta del proyecto y abre `http://localhost:8000/` en tu navegador **o** sube los archivos a GitHub y habilita **Pages**.
2. Concede permiso de acceso a la cámara cuando el navegador lo solicite.
3. Pulsa **Analizar** para capturar la imagen y obtener la recomendación generada por el modelo.
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
