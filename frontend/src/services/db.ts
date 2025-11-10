import { IDBPDatabase, openDB } from 'idb';

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  cardCount: number;
}

export interface OCRResult {
  id: string;
  deckId: string;
  imageUrl: string;
  text: string;
  confidence: number;
  createdAt: number;
}

export interface OcclusionMetadata {
  id: string;
  deckId: string;
  cardIndex: number;
  occlusionRegions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface ExportQueue {
  id: string;
  deckId: string;
  exportType: 'cards' | 'metadata' | 'all';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  data: unknown;
  error?: string;
}

let db: IDBPDatabase | null = null;

const DB_NAME = 'AnkiOcclusion';
const DB_VERSION = 1;

const STORES = {
  DECKS: 'decks',
  OCR_RESULTS: 'ocrResults',
  OCCLUSION_METADATA: 'occlusionMetadata',
  EXPORT_QUEUE: 'exportQueue',
};

async function getDB(): Promise<IDBPDatabase> {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(upgradeDb) {
      // Create decks store
      if (!upgradeDb.objectStoreNames.contains(STORES.DECKS)) {
        upgradeDb.createObjectStore(STORES.DECKS, { keyPath: 'id' });
      }

      // Create OCR results store
      if (!upgradeDb.objectStoreNames.contains(STORES.OCR_RESULTS)) {
        const ocrStore = upgradeDb.createObjectStore(STORES.OCR_RESULTS, { keyPath: 'id' });
        ocrStore.createIndex('deckId', 'deckId');
      }

      // Create occlusion metadata store
      if (!upgradeDb.objectStoreNames.contains(STORES.OCCLUSION_METADATA)) {
        const occlusionStore = upgradeDb.createObjectStore(STORES.OCCLUSION_METADATA, {
          keyPath: 'id',
        });
        occlusionStore.createIndex('deckId', 'deckId');
      }

      // Create export queue store
      if (!upgradeDb.objectStoreNames.contains(STORES.EXPORT_QUEUE)) {
        const queueStore = upgradeDb.createObjectStore(STORES.EXPORT_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status');
        queueStore.createIndex('deckId', 'deckId');
      }
    },
  });

  return db;
}

export async function closeDDB(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}

// Deck operations
export async function addDeck(deck: Deck): Promise<string> {
  const database = await getDB();
  const result = await database.add(STORES.DECKS, deck);
  return String(result);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const database = await getDB();
  return database.get(STORES.DECKS, id);
}

export async function getAllDecks(): Promise<Deck[]> {
  const database = await getDB();
  return database.getAll(STORES.DECKS);
}

export async function updateDeck(deck: Deck): Promise<void> {
  const database = await getDB();
  await database.put(STORES.DECKS, deck);
}

export async function deleteDeck(id: string): Promise<void> {
  const database = await getDB();
  await database.delete(STORES.DECKS, id);
  // Clean up related data
  await deleteOCRResultsByDeck(id);
  await deleteOcclusionMetadataByDeck(id);
  await deleteExportQueueByDeck(id);
}

// OCR Results operations
export async function addOCRResult(result: OCRResult): Promise<string> {
  const database = await getDB();
  const id = await database.add(STORES.OCR_RESULTS, result);
  return String(id);
}

export async function getOCRResult(id: string): Promise<OCRResult | undefined> {
  const database = await getDB();
  return database.get(STORES.OCR_RESULTS, id);
}

export async function getOCRResultsByDeck(deckId: string): Promise<OCRResult[]> {
  const database = await getDB();
  return database.getAllFromIndex(STORES.OCR_RESULTS, 'deckId', deckId);
}

export async function updateOCRResult(result: OCRResult): Promise<void> {
  const database = await getDB();
  await database.put(STORES.OCR_RESULTS, result);
}

export async function deleteOCRResult(id: string): Promise<void> {
  const database = await getDB();
  await database.delete(STORES.OCR_RESULTS, id);
}

export async function deleteOCRResultsByDeck(deckId: string): Promise<void> {
  const database = await getDB();
  const results = await database.getAllFromIndex(STORES.OCR_RESULTS, 'deckId', deckId);
  for (const result of results) {
    await database.delete(STORES.OCR_RESULTS, result.id);
  }
}

// Occlusion Metadata operations
export async function addOcclusionMetadata(metadata: OcclusionMetadata): Promise<string> {
  const database = await getDB();
  const id = await database.add(STORES.OCCLUSION_METADATA, metadata);
  return String(id);
}

export async function getOcclusionMetadata(id: string): Promise<OcclusionMetadata | undefined> {
  const database = await getDB();
  return database.get(STORES.OCCLUSION_METADATA, id);
}

export async function getOcclusionMetadataByDeck(deckId: string): Promise<OcclusionMetadata[]> {
  const database = await getDB();
  return database.getAllFromIndex(STORES.OCCLUSION_METADATA, 'deckId', deckId);
}

export async function updateOcclusionMetadata(metadata: OcclusionMetadata): Promise<void> {
  const database = await getDB();
  await database.put(STORES.OCCLUSION_METADATA, metadata);
}

export async function deleteOcclusionMetadata(id: string): Promise<void> {
  const database = await getDB();
  await database.delete(STORES.OCCLUSION_METADATA, id);
}

export async function deleteOcclusionMetadataByDeck(deckId: string): Promise<void> {
  const database = await getDB();
  const metadata = await database.getAllFromIndex(STORES.OCCLUSION_METADATA, 'deckId', deckId);
  for (const item of metadata) {
    await database.delete(STORES.OCCLUSION_METADATA, item.id);
  }
}

// Export Queue operations
export async function addToExportQueue(item: ExportQueue): Promise<string> {
  const database = await getDB();
  const id = await database.add(STORES.EXPORT_QUEUE, item);
  return String(id);
}

export async function getExportQueueItem(id: string): Promise<ExportQueue | undefined> {
  const database = await getDB();
  return database.get(STORES.EXPORT_QUEUE, id);
}

export async function getPendingExports(): Promise<ExportQueue[]> {
  const database = await getDB();
  return database.getAllFromIndex(STORES.EXPORT_QUEUE, 'status', 'pending');
}

export async function updateExportQueueItem(item: ExportQueue): Promise<void> {
  const database = await getDB();
  await database.put(STORES.EXPORT_QUEUE, item);
}

export async function deleteExportQueueItem(id: string): Promise<void> {
  const database = await getDB();
  await database.delete(STORES.EXPORT_QUEUE, id);
}

export async function deleteExportQueueByDeck(deckId: string): Promise<void> {
  const database = await getDB();
  const items = await database.getAllFromIndex(STORES.EXPORT_QUEUE, 'deckId', deckId);
  for (const item of items) {
    await database.delete(STORES.EXPORT_QUEUE, item.id);
  }
}

// Cache management
export async function getCacheStats(): Promise<{
  deckCount: number;
  ocrResultCount: number;
  occlusionMetadataCount: number;
  pendingExportsCount: number;
  totalSize: number;
}> {
  const database = await getDB();

  const decks = await database.getAll(STORES.DECKS);
  const ocrResults = await database.getAll(STORES.OCR_RESULTS);
  const occlusionMetadata = await database.getAll(STORES.OCCLUSION_METADATA);
  const pendingExports = await getPendingExports();

  // Rough estimation of size in bytes
  const estimateSize = (obj: unknown): number => {
    return new Blob([JSON.stringify(obj)]).size;
  };

  const totalSize =
    decks.reduce((sum, item) => sum + estimateSize(item), 0) +
    ocrResults.reduce((sum, item) => sum + estimateSize(item), 0) +
    occlusionMetadata.reduce((sum, item) => sum + estimateSize(item), 0) +
    pendingExports.reduce((sum, item) => sum + estimateSize(item), 0);

  return {
    deckCount: decks.length,
    ocrResultCount: ocrResults.length,
    occlusionMetadataCount: occlusionMetadata.length,
    pendingExportsCount: pendingExports.length,
    totalSize,
  };
}

export async function clearAllData(): Promise<void> {
  const database = await getDB();
  await database.clear(STORES.DECKS);
  await database.clear(STORES.OCR_RESULTS);
  await database.clear(STORES.OCCLUSION_METADATA);
  await database.clear(STORES.EXPORT_QUEUE);
}

export async function exportDataAsJSON(): Promise<string> {
  const database = await getDB();

  const data = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    decks: await database.getAll(STORES.DECKS),
    ocrResults: await database.getAll(STORES.OCR_RESULTS),
    occlusionMetadata: await database.getAll(STORES.OCCLUSION_METADATA),
  };

  return JSON.stringify(data, null, 2);
}

interface ImportData {
  version: number;
  exportedAt: string;
  decks: Deck[];
  ocrResults: OCRResult[];
  occlusionMetadata: OcclusionMetadata[];
}

export async function importDataFromJSON(jsonString: string): Promise<void> {
  const database = await getDB();
  const data = JSON.parse(jsonString) as ImportData;

  for (const deck of data.decks || []) {
    await database.put(STORES.DECKS, deck);
  }

  for (const result of data.ocrResults || []) {
    await database.put(STORES.OCR_RESULTS, result);
  }

  for (const metadata of data.occlusionMetadata || []) {
    await database.put(STORES.OCCLUSION_METADATA, metadata);
  }
}
