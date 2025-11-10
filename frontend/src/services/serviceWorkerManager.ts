import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;

export async function registerServiceWorker(): Promise<Workbox> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    throw new Error('Service Workers not supported');
  }

  if (wb) return wb;

  wb = new Workbox('/sw.js');

  // Handle updates to the service worker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb.addEventListener('controlling' as any, () => {
    console.log('Service worker is now controlling the app');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb.addEventListener('waiting' as any, () => {
    console.log('New service worker waiting to activate');
    notifyNewVersionAvailable();
  });

  // Handle background sync events
  if ('sync' in ServiceWorkerRegistration.prototype) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wb.addEventListener('installed' as any, () => {
      console.log('Service worker installed');
    });
  }

  try {
    await wb.register();
    console.log('Service Worker registered successfully');
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    wb = null;
    throw error;
  }

  return wb;
}

export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
  wb = null;
}

export function getServiceWorkerInstance(): Workbox | null {
  return wb;
}

export async function skipWaitingServiceWorker(): Promise<void> {
  if (!wb) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wb.addEventListener('controlling' as any, () => {
    window.location.reload();
  });

  wb.messageSkipWaiting();
}

export async function isOnline(): Promise<boolean> {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function requestBackgroundSync(tag: string, data?: unknown): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const syncReg = registration as any;
    if (syncReg.sync) {
      // Store sync data before requesting sync
      if (data) {
        const syncDataKey = `sync_${tag}_${Date.now()}`;
        sessionStorage.setItem(syncDataKey, JSON.stringify(data));
      }

      await syncReg.sync.register(tag);
      console.log('Background sync registered for:', tag);
      return true;
    }
  } catch (error) {
    console.error('Failed to register background sync:', error);
    return false;
  }

  return false;
}

function notifyNewVersionAvailable(): void {
  const event = new CustomEvent('sw-update-available');
  window.dispatchEvent(event);
}

export function subscribeToNewVersion(callback: () => void): () => void {
  window.addEventListener('sw-update-available', callback);
  return () => window.removeEventListener('sw-update-available', callback);
}
