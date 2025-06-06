const video = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');
const captureButton = document.getElementById('capture');
let classifier;

function cargarModelo() {
    classifier = ml5.KNNClassifier();
    classifier.addExample([30, 20, 40], 'Tonos claros y base luminosa para iluminar tu rostro.');
    classifier.addExample([180, 40, 120], 'Colores neutros y rubores suaves.');
    classifier.addExample([330, 70, 200], 'Tonos intensos y delineados marcados.');
}

function iniciarCamara() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.error('No se pudo acceder a la cámara:', err);
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
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let hSum = 0, sSum = 0, vSum = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const [h, s, v] = rgbToHsv(r, g, b);
        hSum += h;
        sSum += s;
        vSum += v;
    }

    const hAvg = hSum / pixelCount;
    const sAvg = sSum / pixelCount;
    const vAvg = vSum / pixelCount;

    mostrarResultado(hAvg, sAvg, vAvg);
}

function mostrarResultado(h, s, v) {
    classifier.classify([h, s, v])
        .then(result => {
            const label = result.label;
            resultDiv.innerHTML = `Tono medio: ${h.toFixed(1)}\u00b0, Saturaci\u00f3n media: ${s.toFixed(1)}%, Brillo medio: ${v.toFixed(1)}<br>Recomendaci\u00f3n: ${label}`;
        })
        .catch(err => {
            console.error('Error al clasificar la imagen:', err);
            resultDiv.textContent = 'Error al obtener la recomendaci\u00f3n.';
        });
}

captureButton.addEventListener('click', analizarImagen);

window.addEventListener('load', () => {
    iniciarCamara();
    cargarModelo();
});
