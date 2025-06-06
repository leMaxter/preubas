// script.js

const video = document.getElementById("videoElement");
const canvas = document.getElementById("canvas");
const resultDiv = document.getElementById("result");
const captureButton = document.getElementById("capture");

let knn;                     // Clasificador simulado
let lastBox = null;          // Última caja facial detectada (normalizada)
let deteccionActiva = false; // Indica que MediaPipe ya ha detectado al menos un rostro

// 1) Inicializar el “clasificador” (simulado con reglas muy sencillas)
function cargarClasificador() {
  knn = {
    classify: ([h, s, v]) => {
      if (v < 100) return { label: "Tonos intensos y delineados marcados." };
      if (h < 100) return { label: "Tonos claros y base luminosa para iluminar tu rostro." };
      return { label: "Colores neutros y rubores suaves." };
    },
  };
  console.log("✅ Clasificador cargado");
}

// 2) Función auxiliar RGB → HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, v * 255];
}

// 3) Dibuja el vídeo en el canvas y extrae HSV promedio de la última caja detectada
function procesarYClasificar() {
  if (!lastBox) {
    resultDiv.textContent = "⚠️ No se detecta rostro actualmente.";
    return;
  }

  // Ajustamos canvas al tamaño real del vídeo
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Caja normalizada a píxeles
  const { xCenter, yCenter, width, height } = lastBox;
  const x = (xCenter - width / 2) * canvas.width;
  const y = (yCenter - height / 2) * canvas.height;
  const w = width * canvas.width;
  const h = height * canvas.height;

  let data;
  try {
    data = ctx.getImageData(x, y, w, h).data;
  } catch (err) {
    console.error("❌ No se pudo leer la región facial:", err);
    resultDiv.textContent = "❌ Error al leer la imagen del rostro.";
    return;
  }

  // Calculamos HSV promedio
  let hSum = 0, sSum = 0, vSum = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    hSum += h;
    sSum += s;
    vSum += v;
  }
  const hAvg = hSum / pixelCount;
  const sAvg = sSum / pixelCount;
  const vAvg = vSum / pixelCount;
  console.log("🎨 HSV promedio:", hAvg, sAvg, vAvg);

  // Clasificación con el KNN simulado
  const { label } = knn.classify([hAvg, sAvg, vAvg]);
  resultDiv.innerHTML = `
    <strong>Recomendación:</strong> ${label}<br>
    <small>HSV promedio: ${hAvg.toFixed(1)}°, ${sAvg.toFixed(1)}%, ${vAvg.toFixed(1)}</small>
  `;
}

// 4) Configuramos MediaPipe Face Detection usando la clase correcta “FaceDetection”
const faceDetector = new FaceDetection({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
});
faceDetector.setOptions({
  modelSelection: 1,           // 0 = corto alcance, 1 = largo alcance
  minDetectionConfidence: 0.6, // umbral mínimo
});

faceDetector.onResults((results) => {
  if (results.detections.length > 0) {
    // Tomamos la primera detección
    lastBox = results.detections[0].boundingBox;
    if (!deteccionActiva) {
      deteccionActiva = true;
      console.log("🧠 MediaPipe lista: rostros detectándose continuamente");
      resultDiv.textContent = "✔️ Rostro detectado. Pulsa Analizar cuando quieras.";
    }
  } else {
    lastBox = null;
  }
});

// 5) Iniciar la cámara y vincular con MediaPipe
function iniciarCamara() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        console.log("📸 Cámara activada");
        new Camera(video, {
          onFrame: async () => {
            await faceDetector.send({ image: video });
          },
          width: 640,
          height: 480,
        }).start();
      };
    })
    .catch((err) => {
      console.error("❌ No se pudo acceder a la cámara:", err);
      resultDiv.textContent = "Error al acceder a la cámara.";
    });
}

// 6) Al pulsar “Analizar”, procesar y clasificar
captureButton.addEventListener("click", () => {
  resultDiv.textContent = "Analizando...";
  procesarYClasificar();
});

// 7) Arrancar todo al cargar la página
window.addEventListener("load", () => {
  cargarClasificador();
  iniciarCamara();
});
