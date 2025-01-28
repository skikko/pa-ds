// Funzionalità di base (es. gestione pulsanti, installazione PWA)
document.addEventListener('DOMContentLoaded', () => {
  // Gestione pulsante "Installa su tuo device"
  let deferredPrompt;
  const installButton = document.createElement('button');
  installButton.textContent = 'Installa su tuo device';
  installButton.classList.add('btn');
  document.querySelector('#pwa .container').appendChild(installButton);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
  });

  installButton.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Installazione accettata');
        }
        deferredPrompt = null;
      });
    }
  });
});
