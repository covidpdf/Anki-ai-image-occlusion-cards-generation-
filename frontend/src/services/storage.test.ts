import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getItem, setItem, removeItem, StorageError } from './storage'
import * as idbKeyval from 'idb-keyval'

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}))

describe('storage service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getItem', () => {
    it('should retrieve an existing item successfully', async () => {
      const mockData = { test: 'value' }
      vi.mocked(idbKeyval.get).mockResolvedValue(mockData)

      const result = await getItem<typeof mockData>('my-key')

      expect(result).toEqual(mockData)
      expect(idbKeyval.get).toHaveBeenCalledWith('aoi:my-key')
    })

    it('should return null when item does not exist', async () => {
      vi.mocked(idbKeyval.get).mockResolvedValue(undefined)

      const result = await getItem('non-existent')

      expect(result).toBeNull()
    })

    it('should throw StorageError on failure', async () => {
      const mockError = new Error('IndexedDB unavailable')
      vi.mocked(idbKeyval.get).mockRejectedValue(mockError)

      const result = getItem('failed')

      await expect(result).rejects.toThrow(StorageError)
      await expect(result).rejects.toThrow('Failed to retrieve data from storage')
    })
  })

  describe('setItem', () => {
    it('should persist data successfully', async () => {
      const testData = { foo: 'bar' }
      vi.mocked(idbKeyval.set).mockResolvedValue(undefined)

      await setItem('test-key', testData)

      expect(idbKeyval.set).toHaveBeenCalledWith('aoi:test-key', testData)
    })

    it('should throw StorageError on failure', async () => {
      const mockError = new Error('Quota exceeded')
      vi.mocked(idbKeyval.set).mockRejectedValue(mockError)

      const result = setItem('test', { large: 'data' })

      await expect(result).rejects.toThrow(StorageError)
      await expect(result).rejects.toThrow('Failed to persist data in storage')
    })
  })

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      vi.mocked(idbKeyval.del).mockResolvedValue(undefined)

      await removeItem('to-delete')

      expect(idbKeyval.del).toHaveBeenCalledWith('aoi:to-delete')
    })

    it('should throw StorageError on failure', async () => {
      const mockError = new Error('Database locked')
      vi.mocked(idbKeyval.del).mockRejectedValue(mockError)

      const result = removeItem('locked')

      await expect(result).rejects.toThrow(StorageError)
      await expect(result).rejects.toThrow('Failed to remove data from storage')
    })
  })
})
