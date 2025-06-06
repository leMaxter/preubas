const video = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');
const captureButton = document.getElementById('capture');

let classifier;
let faceapi;
let faceApiReady = false;

function cargarModelo() {
    classifier = ml5.KNNClassifier();
    classifier.addExample([30, 20, 40], 'Tonos claros y base luminosa para iluminar tu rostro.');
    classifier.addExample([180, 40, 120], 'Colores neutros y rubores suaves.');
    classifier.addExample([330, 70, 200], 'Tonos intensos y delineados marcados.');
    console.log("✅ Modelo KNN cargado");
}

function iniciarFaceApi() {
    const options = { withLandmarks: true, withDescriptors: false };
    faceapi = ml5.faceApi(video, options, () => {
        console.log("📥 Modelo de FaceApi cargado");

        // Verificamos que detecte algo desde el inicio
        faceapi.detect((err, results) => {
            if (err) {
                console.error("❌ Error inicial detect:", err);
                resultDiv.textContent = 'Error al inicializar FaceApi.';
                return;
            }

            console.log("🧠 Primera detección completada:", results);
            faceApiReady = true;
            resultDiv.textContent = "✔️ El modelo está listo. Puedes pulsar Analizar.";
        });
    });
}

function iniciarCamara() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.onloadeddata = () => {
                    console.log("📸 Cámara activada");
                    iniciarFaceApi();
                };
            })
            .catch(err => {
                console.error('❌ No se pudo acceder a la cámara:', err);
                resultDiv.textContent = 'No se pudo acceder a la cámara.';
            });
    } else {
        resultDiv.textContent = 'La cámara no está disponible en este navegador.';
    }
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
    console.log("📍 Botón presionado");

    if (!faceApiReady) {
        console.warn("⏳ FaceApi aún no está lista");
        resultDiv.textContent = 'El modelo está cargándose, por favor espera...';
        return;
    }

    console.log("📦 Ejecutando faceapi.detect...");
    faceapi.detect((err, results) => {
        if (err) {
            console.error('❌ Error en FaceApi:', err);
            resultDiv.textContent = 'Error al detectar el rostro.';
            return;
        }

        console.log("🔍 Resultados:", results);

        if (results && results.length > 0 && results[0].alignedRect) {
            const { x, y, width, height } = results[0].alignedRect._box;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = context.getImageData(x, y, width, height).data;

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
        } else {
            console.warn("🚫 No se detectó rostro o falta alignedRect");
            resultDiv.textContent = 'No se detectó un rostro en la imagen.';
        }
    });
}

function mostrarResultado(h, s, v) {
    classifier.classify([h, s, v])
        .then(result => {
            console.log("✅ Clasificación:", result);
            const label = result.label;
            resultDiv.innerHTML = `Tono medio: ${h.toFixed(1)}°, Saturación media: ${s.toFixed(1)}%, Brillo medio: ${v.toFixed(1)}<br><strong>Recomendación:</strong> ${label}`;
        })
        .catch(err => {
            console.error('❌ Error al clasificar:', err);
            resultDiv.textContent = 'Error al obtener la recomendación.';
        });
}

// Iniciar todo
window.addEventListener('load', () => {
    iniciarCamara();
    cargarModelo();
});

// Compatibilidad móvil
captureButton.addEventListener('click', analizarImagen);
captureButton.addEventListener('touchstart', analizarImagen);
