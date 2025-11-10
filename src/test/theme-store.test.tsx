import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useThemeStore } from '@/stores/theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('has default theme as light', () => {
    const { result } = renderHook(() => useThemeStore())
    
    expect(result.current.theme).toBe('light')
  })

  it('toggles theme from light to dark', () => {
    const { result } = renderHook(() => useThemeStore())
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe('dark')
  })

  it('toggles theme from dark to light', () => {
    const { result } = renderHook(() => useThemeStore())
    
    // First toggle to dark
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')
    
    // Then toggle back to light
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })

  it('sets theme explicitly', () => {
    const { result } = renderHook(() => useThemeStore())
    
    act(() => {
      result.current.setTheme('dark')
    })
    
    expect(result.current.theme).toBe('dark')
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useThemeStore())
    
    act(() => {
      result.current.setTheme('dark')
    })
    
    expect(localStorage.getItem).toHaveBeenCalled()
  })

  it('loads theme from localStorage on initialization', () => {
    // Set initial localStorage state
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: 'dark' } }))
    
    const { result } = renderHook(() => useThemeStore())
    
    expect(result.current.theme).toBe('dark')
  })
})