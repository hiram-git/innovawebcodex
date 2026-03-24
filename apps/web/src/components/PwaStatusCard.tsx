import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PwaStatusCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [message, setMessage] = useState('PWA base lista para validación.');

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setMessage('Instalación disponible para este dispositivo.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      setMessage('El navegador todavía no expone instalación PWA.');
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setMessage(choice.outcome === 'accepted' ? 'Instalación aceptada.' : 'Instalación descartada por el usuario.');
    setDeferredPrompt(null);
  };

  return (
    <div className="card pwa-card">
      <h3>PWA base</h3>
      <p>{online ? 'Conectado' : 'Sin conexión'}</p>
      <p>{deferredPrompt ? 'Instalable' : 'Esperando criterio del navegador'}</p>
      <p>{message}</p>
      <button type="button" onClick={install}>Instalar app</button>
    </div>
  );
}
