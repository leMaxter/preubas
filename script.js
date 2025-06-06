// script.js

const video = document.getElementById("videoElement");
const canvas = document.getElementById("canvas");
const resultDiv = document.getElementById("result");
const captureButton = document.getElementById("capture");

let knn;                      // Nuestro clasificador KNN simulado
let lastBox = null;           // Aquí guardaremos la última caja facial detectada
let deteccionActiva = false;  // Indicador de que MediaPipe ya está listo

// 1) Inicializar el “clasificador” (simulado con reglas sencillas)
function cargarClasificador() {
  // Simulamos un KNN básico sin ml5.js para no cargar librerías extra:
  knn = {
    classify: ([h, s, v]) => {
      // Tres reglas arbitrarias solamente como ejemplo:
      if (v < 100) return { label: "Tonos intensos y delineados marcados." };
      if (h < 100) return { label: "Tonos claros y base luminosa para iluminar tu rostro." };
      return { label: "Colores neutros y rubores suaves." };
    },
  };
  console.log("✅ Clasificador cargado");
}

// 2) Función auxiliar para convertir RGB → HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    v = max;
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

// 3) Función que dibuja el video en el canvas y extrae el color promedio sobre la última caja
function procesarYClasificar() {
  if (!lastBox) {
    resultDiv.textContent = "⚠️ No se detecta rostro actualmente.";
    return;
  }

  // Pintamos en el canvas la imagen actual del video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Extraemos las coordenadas de la última cara detectada (normalizadas)
  const { xCenter, yCenter, width, height } = lastBox;
  const x = (xCenter - width / 2) * canvas.width;
  const y = (yCenter - height / 2) * canvas.height;
  const w = width * canvas.width;
  const h = height * canvas.height;

  // Intentamos leer los píxeles de la región facial
  let data;
  try {
    data = ctx.getImageData(x, y, w, h).data;
  } catch (err) {
    console.error("❌ No se pudo obtener la imagen de la región facial:", err);
    resultDiv.textContent = "❌ Error al leer la imagen del rostro.";
    return;
  }

  // Calculamos HSV promedio
  let hSum = 0,
    sSum = 0,
    vSum = 0;
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

  // Clasificamos con nuestro KNN simulado
  const { label } = knn.classify([hAvg, sAvg, vAvg]);
  resultDiv.innerHTML = `
    <strong>Recomendación:</strong> ${label}<br>
    <small>HSV promedio: ${hAvg.toFixed(1)}°, ${sAvg.toFixed(1)}%, ${vAvg.toFixed(1)}</small>
  `;
}

// 4) Configuramos MediaPipe Face Detection
const faceDetector = new FaceDetection.FaceDetection({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
});
faceDetector.setOptions({
  modelSelection: 1,          // Modelo "largo alcance" (más preciso pero más pesado)
  minDetectionConfidence: 0.6, // confianza mínima para considerar una detección
});

// Cada vez que MediaPipe detecta en el frame, guardamos la caja en lastBox
faceDetector.onResults((results) => {
  if (results.detections.length > 0) {
    // Tomamos siempre la primera cara (results.detections[0])
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

// 5) Iniciamos la cámara y vinculamos el detector para procesar cada frame
function iniciarCamara() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        console.log("📸 Cámara activada");
        // Creamos un objeto Camera de MediaPipe que envía cada frame a faceDetector
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

// 6) Al pulsar el botón, procesamos la última caja facial
captureButton.addEventListener("click", () => {
  resultDiv.textContent = "Analizando...";
  procesarYClasificar();
});

// 7) Arrancamos todo cuando se cargue la página
window.addEventListener("load", () => {
  cargarClasificador();
  iniciarCamara();
});
