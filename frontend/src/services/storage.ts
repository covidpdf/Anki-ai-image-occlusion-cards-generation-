import { del, get, set } from 'idb-keyval'

const logError = (error: unknown, action: string) => {
  if (error instanceof Error) {
    console.error(`IndexedDB ${action} error:`, error.message)
  } else {
    console.error(`IndexedDB ${action} error:`, error)
  }
}

export const storageGet = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await get(key)
    return (value as T | undefined) ?? null
  } catch (error) {
    logError(error, `get for "${key}"`)
    return null
  }
}

export const storageSet = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    await set(key, value)
    return true
  } catch (error) {
    logError(error, `set for "${key}"`)
    return false
  }
}

export const storageRemove = async (key: string): Promise<boolean> => {
  try {
    await del(key)
    return true
  } catch (error) {
    logError(error, `remove for "${key}"`)
    return false
  }
}
