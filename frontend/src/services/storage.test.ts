import { afterEach, describe, expect, it, vi } from 'vitest'
import { storageGet, storageRemove, storageSet } from './storage'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('storage service', () => {
  it('stores a value and returns true on success', async () => {
    vi.mocked(idbSet).mockResolvedValue(undefined)

    const result = await storageSet('key', { value: 1 })

    expect(result).toBe(true)
    expect(idbSet).toHaveBeenCalledWith('key', { value: 1 })
  })

  it('returns false when set fails', async () => {
    vi.mocked(idbSet).mockRejectedValue(new Error('failure'))

    const result = await storageSet('key', { value: 1 })

    expect(result).toBe(false)
  })

  it('retrieves stored values', async () => {
    vi.mocked(idbGet).mockResolvedValue({ value: 2 })

    const result = await storageGet<{ value: number }>('key')

    expect(result).toEqual({ value: 2 })
    expect(idbGet).toHaveBeenCalledWith('key')
  })

  it('returns null when get fails', async () => {
    vi.mocked(idbGet).mockRejectedValue(new Error('failure'))

    const result = await storageGet('missing')

    expect(result).toBeNull()
  })

  it('removes a value and returns true on success', async () => {
    vi.mocked(idbDel).mockResolvedValue(undefined)

    const result = await storageRemove('key')

    expect(result).toBe(true)
    expect(idbDel).toHaveBeenCalledWith('key')
  })

  it('returns false when remove fails', async () => {
    vi.mocked(idbDel).mockRejectedValue(new Error('failure'))

    const result = await storageRemove('key')

    expect(result).toBe(false)
  })
})
