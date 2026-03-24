/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean;
    onRegisteredSW?: (swUrl: string, registration?: ServiceWorkerRegistration) => void;
    onOfflineReady?: () => void;
  }): () => void;
}
