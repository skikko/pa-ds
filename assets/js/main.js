// Elementi del DOM
const video = document.getElementById('camera-preview');
const canvas = document.getElementById('photo-canvas');
const ctx = canvas.getContext('2d');
const captureButton = document.getElementById('capture-button');
const uploadFrameButton = document.getElementById('upload-frame-button');
const frameUpload = document.getElementById('frame-upload');
const saveButton = document.getElementById('save-button');
const printButton = document.getElementById('print-button');
const discardButton = document.getElementById('discard-button');
const installButton = document.getElementById('install-button');

let currentFrame = null;

// Accesso alla fotocamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
    })
    .catch(error => console.error('Errore accesso fotocamera:', error));

// Scatta foto
captureButton.addEventListener('click', () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (currentFrame) {
        ctx.drawImage(currentFrame, 0, 0, canvas.width, canvas.height);
    }
    video.style.display = 'none';
});

// Carica cornice personalizzata
frameUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            currentFrame = img;
        };
    }
});

uploadFrameButton.addEventListener('click', () => frameUpload.click());

// Scarica foto
saveButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `photo_${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Stampa foto
printButton.addEventListener('click', () => {
    const printWindow = window.open('');
    printWindow.document.write(`<img src="${canvas.toDataURL('image/png')}" />`);
    printWindow.document.close();
    printWindow.print();
});

// Scarta foto
discardButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    video.style.display = 'block';
});

// Installazione PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.style.display = 'block';
});

installButton.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Utente ha installato la PWA');
        }
        deferredPrompt = null;
    });
});