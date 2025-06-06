const video = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');
const captureButton = document.getElementById('capture');

let classifier;
let faceDetector;
let faceReady = false;

function cargarModelo() {
  classifier = ml5.KNNClassifier();
  classifier.addExample([30, 20, 40], 'Tonos claros y base luminosa para iluminar tu rostro.');
  classifier.addExample([180, 40, 120], 'Colores neutros y rubores suaves.');
  classifier.addExample([330, 70, 200], 'Tonos intensos y delineados marcados.');
  console.log("✅ Modelo KNN cargado");
}

function iniciarCamara() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        console.log("📸 Cámara activada");
        iniciarDetector();
      };
    })
    .catch(err => {
      console.error('❌ Error al acceder a la cámara:', err);
      resultDiv.textContent = 'Error al acceder a la cámara.';
    });
}

function iniciarDetector() {
  faceDetector = new FaceDetection.FaceDetection({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
  });

  faceDetector.setOptions({
    model: 'short',
    minDetectionConfidence: 0.5
  });

  faceDetector.onResults((results) => {
    if (results.detections.length > 0) {
      faceReady = true;
      console.log("🧠 Detección lista");
      resultDiv.textContent = "✔️ Rostro detectado. Puedes pulsar Analizar.";
    }
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await faceDetector.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, v * 255];
}

function analizarImagen() {
  if (!faceReady) {
    resultDiv.textContent = '⏳ Esperando detección de rostro...';
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  let data;
  try {
    data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch (e) {
    console.error("❌ Error al leer imagen:", e);
    resultDiv.textContent = 'No se pudo leer la imagen del rostro.';
    return;
  }

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
  mostrarResultado(hAvg, sAvg, vAvg);
}

function mostrarResultado(h, s, v) {
  classifier.classify([h, s, v])
    .then(result => {
      console.log("✅ Clasificación:", result);
      const label = result.label;
      resultDiv.innerHTML = `
        Tono medio: ${h.toFixed(1)}°, Saturación media: ${s.toFixed(1)}%, Brillo medio: ${v.toFixed(1)}<br>
        <strong>Recomendación:</strong> ${label}
      `;
    })
    .catch(err => {
      console.error('❌ Error al clasificar:', err);
      resultDiv.textContent = 'Error al obtener la recomendación.';
    });
}

window.addEventListener('load', () => {
  iniciarCamara();
  cargarModelo();
});

captureButton.addEventListener('click', analizarImagen);
