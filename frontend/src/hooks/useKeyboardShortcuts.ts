import { useEffect, useCallback } from 'react'

export interface KeyboardShortcutConfig {
  [key: string]: () => void
}

/**
 * Custom hook for handling keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutConfig,
  enabled = true
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Build the key combination string
      const keys: string[] = []

      if (event.ctrlKey || event.metaKey) keys.push('ctrl')
      if (event.shiftKey) keys.push('shift')
      if (event.altKey) keys.push('alt')

      const key = event.key.toLowerCase()
      if (key.length === 1) {
        keys.push(key)
      } else if (key === 'enter') {
        keys.push('enter')
      } else if (key === 'escape') {
        keys.push('escape')
      } else if (key === ' ') {
        keys.push('space')
      } else if (key === 'delete') {
        keys.push('delete')
      } else if (key === 'backspace') {
        keys.push('backspace')
      }

      const shortcutKey = keys.join('+')

      if (shortcuts[shortcutKey]) {
        event.preventDefault()
        shortcuts[shortcutKey]()
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * Predefined keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  DELETE: 'delete',
  BACKSPACE: 'backspace',
  ESCAPE: 'escape',
  ENTER: 'enter',
  SPACE: 'space',
  SELECT_ALL: 'ctrl+a',
} as const
