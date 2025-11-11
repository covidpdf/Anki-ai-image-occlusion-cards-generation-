import { del, get, set } from 'idb-keyval'

const STORAGE_PREFIX = 'aoi:'

const withPrefix = (key: string) => `${STORAGE_PREFIX}${key}`

export class StorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'StorageError'
  }
}

export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await get<T | null>(withPrefix(key))
    return value ?? null
  } catch (error) {
    console.error(`[storage] Failed to get key "${key}"`, error)
    throw new StorageError('Failed to retrieve data from storage', error)
  }
}

export const setItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    await set(withPrefix(key), value)
  } catch (error) {
    console.error(`[storage] Failed to set key "${key}"`, error)
    throw new StorageError('Failed to persist data in storage', error)
  }
}

export const removeItem = async (key: string): Promise<void> => {
  try {
    await del(withPrefix(key))
  } catch (error) {
    console.error(`[storage] Failed to remove key "${key}"`, error)
    throw new StorageError('Failed to remove data from storage', error)
  }
}
