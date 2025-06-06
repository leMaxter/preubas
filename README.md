# preubas

Esta demo usa la cámara del navegador para analizar la tonalidad de tu rostro y, mediante un sencillo modelo de aprendizaje automático, sugerir un tipo de maquillaje.

## Uso

La cámara solo funciona cuando la página se carga desde un origen seguro. Puedes lanzar un servidor local con:

```bash
python3 -m http.server
```

y abrir `http://localhost:8000/`, o publicar el proyecto en **GitHub Pages** para que se sirva a través de HTTPS.

1. Abre la página y concede permiso para usar la cámara.
2. Pulsa **Analizar** para capturar la imagen y obtener la recomendación.

La clasificación emplea un modelo KNN a través de ml5.js y usa **FaceApi** para detectar el rostro y calcular el color medio solo en esa región. No se almacenan imágenes; la sugerencia es simplemente orientativa.

### Novedades

- Interfaz en tonos rosados con secciones descriptivas.
- El modelo detecta el rostro con FaceApi y analiza tono, saturación y brillo para afinar la recomendación.
