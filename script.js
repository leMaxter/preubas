const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvas');
const resultDiv = document.getElementById('result');
const captureButton = document.getElementById('capture');
const canvasCtx = canvasElement.getContext('2d');

let rostroDetectado = false;
let ultimaImagen = null;

// Simulación de un clasificador sencillo
function obtenerRecomendacion(h, s, v) {
    if (v > 180 && s < 30) {
        return 'Tonos claros y base luminosa para iluminar tu rostro.';
    } else if (s < 50) {
        return 'Colores neutros y rubores suaves.';
    } else {
        return 'Tonos intensos y delineados marcados.';
    }
}

// Inicializar MediaPipe FaceDetection
const faceDetection = new FaceDetection.FaceDetection({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});

faceDetection.setOptions({
    model: 'short',
    minDetectionConfidence: 0.6
});

faceDetection.onResults(onResults);

// Iniciar cámara
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceDetection.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start();

// Procesar resultados de detección
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.detections.length > 0) {
        resultDiv.textContent = "✔️ Rostro detectado. Pulsa Analizar.";
        rostroDetectado = true;
        ultimaImagen = canvasCtx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    } else {
        resultDiv.textContent = "❌ No se detectó rostro aún.";
        rostroDetectado = false;
    }

    canvasCtx.restore();
}

// Convierte RGB a HSV
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) h = 0;
    else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, v * 255];
}

// Analizar imagen cuando se pulsa el botón
captureButton.addEventListener('click', () => {
    if (!rostroDetectado || !ultimaImagen) {
        resultDiv.textContent = "⚠️ No hay rostro detectado.";
        return;
    }

    const data = ultimaImagen.data;
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

    const recomendacion = obtenerRecomendacion(hAvg, sAvg, vAvg);

    resultDiv.innerHTML = `🎨 Tono medio: ${hAvg.toFixed(1)}°, Saturación: ${sAvg.toFixed(1)}%, Brillo: ${vAvg.toFixed(1)}<br><strong>Recomendación:</strong> ${recomendacion}`;
});
