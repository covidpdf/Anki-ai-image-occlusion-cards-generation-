import { create } from 'zustand'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name?: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, _password: string) => {
    try {
      // Mock API call - replace with actual API
      const user = { id: '1', email, name: 'Test User' }
      set({ user, isAuthenticated: true })
    } catch (error) {
      throw new Error('Login failed')
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  register: async (email: string, _password: string, name?: string) => {
    try {
      // Mock API call - replace with actual API
      const user = { id: '1', email, name }
      set({ user, isAuthenticated: true })
    } catch (error) {
      throw new Error('Registration failed')
    }
  },
}))