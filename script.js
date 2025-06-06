const video = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');
const captureButton = document.getElementById('capture');
let classifier;

function cargarModelo() {
    classifier = ml5.KNNClassifier();
    classifier.addExample([40, 40, 40], 'Tonos claros y base luminosa para iluminar tu rostro.');
    classifier.addExample([70, 70, 70], 'Tonos claros y base luminosa para iluminar tu rostro.');
    classifier.addExample([120, 120, 120], 'Colores neutros y rubores suaves.');
    classifier.addExample([150, 150, 150], 'Colores neutros y rubores suaves.');
    classifier.addExample([200, 200, 200], 'Tonos intensos y delineados marcados.');
    classifier.addExample([230, 230, 230], 'Tonos intensos y delineados marcados.');
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

function analizarImagen() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let r = 0, g = 0, b = 0;
    const pixelCount = imageData.data.length / 4;

    for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
    }

    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);

    mostrarResultado(r, g, b);
}

function mostrarResultado(r, g, b) {
    classifier.classify([r, g, b])
        .then(result => {
            const label = result.label;
            resultDiv.innerHTML = `Color promedio: rgb(${r}, ${g}, ${b})<br>Recomendación: ${label}`;
        })
        .catch(err => {
            console.error('Error al clasificar la imagen:', err);
            resultDiv.textContent = 'Error al obtener la recomendación.';
        });
}

captureButton.addEventListener('click', analizarImagen);

window.addEventListener('load', () => {
    iniciarCamara();
    cargarModelo();
});
