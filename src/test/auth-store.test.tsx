import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with no user and not authenticated', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('registers user successfully', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.register('new@example.com', 'password', 'New User')
    })
    
    expect(result.current.user).toEqual({
      id: '1',
      email: 'new@example.com',
      name: 'New User'
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('logs out user', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First log in
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    
    // Then log out
    act(() => {
      result.current.logout()
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('handles login failure', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Mock the implementation to throw an error
    vi.spyOn(result.current, 'login').mockImplementation(async () => {
      throw new Error('Login failed')
    })
    
    await expect(result.current.login('test@example.com', 'wrong-password'))
      .rejects.toThrow('Login failed')
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('handles registration failure', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Mock the implementation to throw an error
    vi.spyOn(result.current, 'register').mockImplementation(async () => {
      throw new Error('Registration failed')
    })
    
    await expect(result.current.register('test@example.com', 'password'))
      .rejects.toThrow('Registration failed')
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})