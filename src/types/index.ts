export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Deck {
  id: string
  name: string
  description?: string
  userId: string
  cardCount: number
  masteredCount: number
  lastStudied?: string
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  deckId: string
  frontImage?: string
  backImage?: string
  frontText?: string
  backText?: string
  difficulty: 'easy' | 'medium' | 'hard'
  interval: number
  repetitions: number
  nextReview: string
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  deckId: string
  cardsStudied: number
  correctAnswers: number
  startTime: string
  endTime?: string
  accuracy: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type Theme = 'light' | 'dark' | 'system'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export interface NavigationItem {
  path: string
  label: string
  icon: React.ComponentType<any>
  badge?: number
}

export interface StudyStats {
  cardsStudied: number
  accuracy: number
  streak: number
  totalTime: number
  averageResponseTime: number
}