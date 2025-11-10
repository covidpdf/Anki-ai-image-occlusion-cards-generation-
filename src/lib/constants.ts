export const APP_CONFIG = {
  NAME: 'Anki AI Image Occlusion',
  DESCRIPTION: 'AI-powered image occlusion flashcard generation',
  VERSION: '1.0.0',
} as const

export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  DECKS: '/decks',
  STUDY: '/study',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
} as const

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const STORAGE_KEYS = {
  THEME: 'theme-storage',
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  DECKS: '/decks',
  CARDS: '/cards',
  UPLOAD: '/upload',
  STUDY: '/study',
} as const