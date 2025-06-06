const video = document.getElementById("videoElement");
const canvas = document.getElementById("canvas");
const resultDiv = document.getElementById("result");
const captureButton = document.getElementById("capture");

let knn;
let detectorReady = false;

// Inicializa el clasificador
function cargarClasificador() {
  knn = {
    classify: ([h, s, v]) => {
      if (v < 100) return { label: 'Tonos intensos y delineados marcados.' };
      if (h < 100) return { label: 'Tonos claros y base luminosa para iluminar tu rostro.' };
      return { label: 'Colores neutros y rubores suaves.' };
    }
  };
  console.log("✅ Clasificador simulado cargado");
}

// Convierte RGB a HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, v * 255];
}

// Mostrar resultado
function mostrarResultado(h, s, v) {
  const result = knn.classify([h, s, v]);
  resultDiv.innerHTML = `
    <strong>Recomendación:</strong> ${result.label}<br>
    <small>HSV Promedio: ${h.toFixed(1)}°, ${s.toFixed(1)}%, ${v.toFixed(1)}</small>
  `;
}

// Procesar detección
function procesarRostro(box) {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const { xCenter, yCenter, width, height } = box;
  const x = (xCenter - width / 2) * canvas.width;
  const y = (yCenter - height / 2) * canvas.height;
  const w = width * canvas.width;
  const h = height * canvas.height;

  try {
    const data = context.getImageData(x, y, w, h).data;
    let hSum = 0, sSum = 0, vSum = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const [hVal, sVal, vVal] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
      hSum += hVal;
      sSum += sVal;
      vSum += vVal;
    }
    mostrarResultado(hSum / pixelCount, sSum / pixelCount, vSum / pixelCount);
  } catch (e) {
    resultDiv.textContent = "❌ No se pudo leer el rostro.";
    console.error(e);
  }
}

// Configura MediaPipe
const faceDetection = new FaceDetection({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});
faceDetection.setOptions({
  modelSelection: 1,
  minDetectionConfidence: 0.6
});
faceDetection.onResults(results => {
  if (results.detections.length > 0) {
    procesarRostro(results.detections[0].boundingBox);
  } else {
    resultDiv.textContent = "No se detectó ningún rostro.";
  }
  detectorReady = true;
});

// Cámara
const camera = new Camera(video, {
  onFrame: async () => {
    if (detectorReady) return; // solo detectar al presionar
    await faceDetection.send({ image: video });
  },
  width: 640,
  height: 480
});
camera.start();

// Botón de análisis
captureButton.addEventListener("click", () => {
  resultDiv.textContent = "Analizando...";
  detectorReady = false;
  faceDetection.send({ image: video });
});

// Iniciar
window.addEventListener("load", () => {
  cargarClasificador();
});
