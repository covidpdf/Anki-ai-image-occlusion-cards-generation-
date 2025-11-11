import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register keyboard shortcuts', () => {
    const onUndo = vi.fn()
    const shortcuts = {
      [KEYBOARD_SHORTCUTS.UNDO]: onUndo,
    }

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    })

    window.dispatchEvent(event)

    expect(onUndo).toHaveBeenCalled()
  })

  it('should not trigger when disabled', () => {
    const onUndo = vi.fn()
    const shortcuts = {
      [KEYBOARD_SHORTCUTS.UNDO]: onUndo,
    }

    renderHook(() => useKeyboardShortcuts(shortcuts, false))

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    })

    window.dispatchEvent(event)

    expect(onUndo).not.toHaveBeenCalled()
  })

  it('should handle multiple shortcuts', () => {
    const onUndo = vi.fn()
    const onRedo = vi.fn()
    const shortcuts = {
      [KEYBOARD_SHORTCUTS.UNDO]: onUndo,
      [KEYBOARD_SHORTCUTS.REDO]: onRedo,
    }

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const undoEvent = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    })

    const redoEvent = new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
    })

    window.dispatchEvent(undoEvent)
    expect(onUndo).toHaveBeenCalled()

    window.dispatchEvent(redoEvent)
    expect(onRedo).toHaveBeenCalled()
  })

  it('should prevent default action', () => {
    const onUndo = vi.fn()
    const shortcuts = {
      [KEYBOARD_SHORTCUTS.UNDO]: onUndo,
    }

    renderHook(() => useKeyboardShortcuts(shortcuts))

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    })

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  describe('KEYBOARD_SHORTCUTS', () => {
    it('should have expected shortcut keys', () => {
      expect(KEYBOARD_SHORTCUTS.UNDO).toBe('ctrl+z')
      expect(KEYBOARD_SHORTCUTS.REDO).toBe('ctrl+y')
      expect(KEYBOARD_SHORTCUTS.DELETE).toBe('delete')
      expect(KEYBOARD_SHORTCUTS.BACKSPACE).toBe('backspace')
      expect(KEYBOARD_SHORTCUTS.ESCAPE).toBe('escape')
      expect(KEYBOARD_SHORTCUTS.ENTER).toBe('enter')
      expect(KEYBOARD_SHORTCUTS.SPACE).toBe('space')
      expect(KEYBOARD_SHORTCUTS.SELECT_ALL).toBe('ctrl+a')
    })
  })
})
