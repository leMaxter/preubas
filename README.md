# preubas

Esta demo utiliza la cámara del navegador para analizar la tonalidad de tu rostro y, mediante un sencillo modelo de aprendizaje automático, sugerir un tipo de maquillaje.

## Uso

1. Abre `index.html` en un navegador con soporte para `getUserMedia` (Chrome, Firefox, etc.).
2. Acepta el permiso para usar la cámara.
3. Pulsa **Analizar** para capturar la imagen y recibir la sugerencia generada por el modelo.

La clasificación se realiza con un modelo KNN definido en la página utilizando la librería [ml5.js](https://ml5js.org/). No se almacenan imágenes y la recomendación es únicamente orientativa.

### Novedades

- Interfaz renovada en tonos rosados para un aspecto más profesional.
- El modelo ahora analiza el tono, saturación y brillo promedio de todo el rostro para afinar la recomendación de maquillaje.
