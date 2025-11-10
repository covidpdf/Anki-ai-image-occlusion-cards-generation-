import { getPendingExports, updateExportQueueItem } from './db';
import type { ExportQueue } from './db';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

export async function syncPendingExports(): Promise<void> {
  try {
    const pendingExports = await getPendingExports();

    if (pendingExports.length === 0) {
      console.log('No pending exports to sync');
      return;
    }

    console.log(`Syncing ${pendingExports.length} pending exports`);

    for (const exportItem of pendingExports) {
      await syncExportItem(exportItem);
    }
  } catch (error) {
    console.error('Error syncing pending exports:', error);
  }
}

async function syncExportItem(exportItem: ExportQueue): Promise<void> {
  try {
    exportItem.status = 'syncing';
    exportItem.updatedAt = Date.now();
    await updateExportQueueItem(exportItem);

    // Simulate API call to sync the export
    const response = await fetch(`${API_URL}/api/exports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deckId: exportItem.deckId,
        exportType: exportItem.exportType,
        data: exportItem.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    exportItem.status = 'completed';
    exportItem.updatedAt = Date.now();
    await updateExportQueueItem(exportItem);

    console.log(`Export ${exportItem.id} synced successfully`);
  } catch (error) {
    exportItem.status = 'failed';
    exportItem.error = String(error);
    exportItem.updatedAt = Date.now();
    await updateExportQueueItem(exportItem);

    console.error(`Failed to sync export ${exportItem.id}:`, error);
  }
}

export function subscribeToSyncEvents(
  callback: (event: 'online' | 'offline' | 'sync-start' | 'sync-complete') => void
): () => void {
  const handleOnline = () => {
    callback('online');
    syncPendingExports();
  };
  const handleOffline = () => callback('offline');

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function checkSyncSupport(): Promise<{
  backgroundSync: boolean;
  serviceWorker: boolean;
  indexedDB: boolean;
}> {
  return {
    backgroundSync: 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype,
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: typeof indexedDB !== 'undefined',
  };
}
