const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture-btn');
const downloadLink = document.getElementById('download-link');
const selectedFrame = document.getElementById('selected-frame');
const uploadFrameBtn = document.getElementById('upload-frame-btn');
const resetFrameBtn = document.getElementById('reset-frame-btn');
const frameInput = document.getElementById('frame-input');
const discardBtn = document.getElementById('discard-btn');
const previewImg = document.getElementById('preview-img');
const printBtn = document.getElementById('print-btn');
const flashBtn = document.getElementById('flash-btn');
const flashOverlay = document.getElementById('flash-overlay');
const notification = document.getElementById('notification');

// Impostazioni iniziali
let flashEnabled = false;
let track; // Per accedere al track della fotocamera
const defaultFrame = 'frames/frame.png'; // Cornice predefinita

// Mostra una notifica
function showNotification(message, duration = 3000) {
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, duration);
}

// Attiva/disattiva flash
flashBtn.addEventListener('click', () => {
  flashEnabled = !flashEnabled;
  flashBtn.textContent = flashEnabled ? "Disattiva Flash" : "Attiva Flash";
  if (track) {
    const capabilities = track.getCapabilities();
    if (capabilities.torch) {
      track.applyConstraints({
        advanced: [{ torch: flashEnabled }]
      }).catch(err => {
        console.error("Errore nell'attivazione del flash:", err);
        showNotification("Flash non supportato su questo dispositivo.");
      });
    } else {
      showNotification("Il flash hardware non è supportato su questo dispositivo.");
    }
  }
});

// Simula il flash visivo
function triggerFlash() {
  if (flashEnabled && !track?.getCapabilities().torch) {
    flashOverlay.style.opacity = '1';
    setTimeout(() => {
      flashOverlay.style.opacity = '0';
    }, 200);
  }
}

// Accesso alla fotocamera
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment",
    width: { ideal: 1671 },
    height: { ideal: 1181 }
  },
  audio: false
}).then(stream => {
  video.srcObject = stream;
  video.play();

  // Ottenere il track video per il controllo del flash
  track = stream.getVideoTracks()[0];
}).catch(err => {
  console.error("Errore nell'accesso alla fotocamera:", err);
  showNotification("Impossibile accedere alla fotocamera. Controlla i permessi o il supporto del tuo browser.");
});

// Scatta Foto
captureBtn.addEventListener('click', () => {
  triggerFlash(); // Attiva l'effetto flash visivo se necessario

  // Disegna l'immagine sul canvas
  ctx.drawImage(video, 0, 0, desiredWidth, desiredHeight);

  const frameImg = new Image();
  frameImg.crossOrigin = 'anonymous';
  frameImg.src = selectedFrame.src;
  frameImg.onload = () => {
    ctx.drawImage(frameImg, 0, 0, desiredWidth, desiredHeight);
    const dataURL = canvas.toDataURL('image/png');
    previewImg.src = dataURL;
    previewImg.style.display = 'block';
    video.style.display = 'none';
    selectedFrame.style.display = 'none';
    downloadLink.href = dataURL;
    downloadLink.style.display = 'block';
    printBtn.style.display = 'block';
    discardBtn.style.display = 'block';
    captureBtn.style.display = 'none';
    uploadFrameBtn.style.display = 'none';
    resetFrameBtn.style.display = 'none';
    showNotification("Foto scattata con successo!");
  };
});

// Carica una cornice personalizzata
uploadFrameBtn.addEventListener('click', () => {
  frameInput.click();
});

frameInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    selectedFrame.src = event.target.result;
    showNotification("Cornice caricata con successo!");
  };
  reader.readAsDataURL(file);
});

// Ripristina la cornice predefinita
resetFrameBtn.addEventListener('click', () => {
  selectedFrame.src = defaultFrame;
  showNotification("Cornice ripristinata.");
});

// Scarta la foto
discardBtn.addEventListener('click', () => {
  previewImg.style.display = 'none';
  video.style.display = 'block';
  selectedFrame.style.display = 'block';
  downloadLink.style.display = 'none';
  discardBtn.style.display = 'none';
  printBtn.style.display = 'none';
  captureBtn.style.display = 'block';
  uploadFrameBtn.style.display = 'block';
  resetFrameBtn.style.display = 'block';
  showNotification("Foto scartata.");
});

// Stampa la foto
printBtn.addEventListener('click', () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<html><head><title>Stampa Immagine</title></head><body style="margin:0; padding:0;">
  <img src="${previewImg.src}" style="width:100%; height:auto;" />
  </body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.document.querySelector('img').onload = () => {
    printWindow.print();
    printWindow.close();
  };
});
