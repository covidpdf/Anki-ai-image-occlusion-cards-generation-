import { describe, it, expect, beforeEach } from 'vitest'
import {
  occlusionReducer,
  initialState,
} from './occlusionReducer'
import { Mask, OcclusionEditorState } from '../types/occlusion'

describe('occlusionReducer', () => {
  let state: OcclusionEditorState

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialState))
  })

  describe('LOAD_IMAGE', () => {
    it('should initialize occlusion data with image dimensions', () => {
      const newState = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })

      expect(newState.occlusionData).toBeDefined()
      expect(newState.occlusionData?.imagePath).toBe('/test.jpg')
      expect(newState.occlusionData?.imageWidth).toBe(800)
      expect(newState.occlusionData?.imageHeight).toBe(600)
      expect(newState.occlusionData?.masks).toEqual([])
      expect(newState.history.length).toBe(1)
      expect(newState.historyIndex).toBe(0)
    })

    it('should reset editor state on image load', () => {
      state.editor.selectedMaskId = 'some-id'
      state.editor.currentMask = { id: 'test', x: 0, y: 0, width: 100, height: 100, label: 'test', isVisible: true }

      const newState = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })

      expect(newState.editor.selectedMaskId).toBeNull()
      expect(newState.editor.currentMask).toBeNull()
    })
  })

  describe('ADD_MASK', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
    })

    it('should add a new mask to occlusion data', () => {
      const mask: Mask = {
        id: 'mask1',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
        isVisible: true,
      }

      const newState = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: mask,
      })

      expect(newState.occlusionData?.masks).toHaveLength(1)
      expect(newState.occlusionData?.masks[0]).toEqual(mask)
    })

    it('should generate ID if not provided', () => {
      const mask = {
        id: '',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
        isVisible: true,
      }

      const newState = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: mask,
      })

      expect(newState.occlusionData?.masks[0].id).toBeTruthy()
      expect(newState.occlusionData?.masks[0].id).toMatch(/^mask_/)
    })

    it('should select the newly added mask', () => {
      const mask: Mask = {
        id: 'mask1',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
        isVisible: true,
      }

      const newState = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: mask,
      })

      expect(newState.editor.selectedMaskId).toBe('mask1')
    })

    it('should add to history', () => {
      const mask: Mask = {
        id: 'mask1',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Mask 1',
        isVisible: true,
      }

      const newState = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: mask,
      })

      expect(newState.history.length).toBe(2)
      expect(newState.historyIndex).toBe(1)
    })
  })

  describe('UPDATE_MASK', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Original',
          isVisible: true,
        },
      })
    })

    it('should update mask properties', () => {
      const newState = occlusionReducer(state, {
        type: 'UPDATE_MASK',
        payload: {
          id: 'mask1',
          x: 20,
          y: 30,
          width: 150,
          height: 75,
          label: 'Updated',
          isVisible: true,
        },
      })

      expect(newState.occlusionData?.masks[0].x).toBe(20)
      expect(newState.occlusionData?.masks[0].y).toBe(30)
      expect(newState.occlusionData?.masks[0].width).toBe(150)
      expect(newState.occlusionData?.masks[0].height).toBe(75)
      expect(newState.occlusionData?.masks[0].label).toBe('Updated')
    })

    it('should not affect other masks', () => {
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask2',
          x: 200,
          y: 200,
          width: 100,
          height: 100,
          label: 'Mask 2',
          isVisible: true,
        },
      })

      const newState = occlusionReducer(state, {
        type: 'UPDATE_MASK',
        payload: {
          id: 'mask1',
          x: 20,
          y: 30,
          width: 150,
          height: 75,
          label: 'Updated',
          isVisible: true,
        },
      })

      expect(newState.occlusionData?.masks).toHaveLength(2)
      expect(newState.occlusionData?.masks[1].x).toBe(200)
    })

    it('should add to history', () => {
      const initialHistoryIndex = state.historyIndex

      const newState = occlusionReducer(state, {
        type: 'UPDATE_MASK',
        payload: {
          id: 'mask1',
          x: 20,
          y: 30,
          width: 150,
          height: 75,
          label: 'Updated',
          isVisible: true,
        },
      })

      expect(newState.historyIndex).toBe(initialHistoryIndex + 1)
    })
  })

  describe('DELETE_MASK', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask2',
          x: 200,
          y: 200,
          width: 100,
          height: 100,
          label: 'Mask 2',
          isVisible: true,
        },
      })
    })

    it('should delete mask by id', () => {
      const newState = occlusionReducer(state, {
        type: 'DELETE_MASK',
        payload: 'mask1',
      })

      expect(newState.occlusionData?.masks).toHaveLength(1)
      expect(newState.occlusionData?.masks[0].id).toBe('mask2')
    })

    it('should deselect mask if it was selected', () => {
      state = occlusionReducer(state, {
        type: 'SELECT_MASK',
        payload: 'mask1',
      })

      const newState = occlusionReducer(state, {
        type: 'DELETE_MASK',
        payload: 'mask1',
      })

      expect(newState.editor.selectedMaskId).toBeNull()
    })

    it('should keep selection if other mask is deleted', () => {
      state = occlusionReducer(state, {
        type: 'SELECT_MASK',
        payload: 'mask1',
      })

      const newState = occlusionReducer(state, {
        type: 'DELETE_MASK',
        payload: 'mask2',
      })

      expect(newState.editor.selectedMaskId).toBe('mask1')
    })

    it('should add to history', () => {
      const initialHistoryIndex = state.historyIndex

      const newState = occlusionReducer(state, {
        type: 'DELETE_MASK',
        payload: 'mask1',
      })

      expect(newState.historyIndex).toBe(initialHistoryIndex + 1)
    })
  })

  describe('SELECT_MASK', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })
    })

    it('should set selected mask id', () => {
      const newState = occlusionReducer(state, {
        type: 'SELECT_MASK',
        payload: 'mask1',
      })

      expect(newState.editor.selectedMaskId).toBe('mask1')
    })

    it('should allow deselection', () => {
      state = occlusionReducer(state, {
        type: 'SELECT_MASK',
        payload: 'mask1',
      })

      const newState = occlusionReducer(state, {
        type: 'SELECT_MASK',
        payload: null,
      })

      expect(newState.editor.selectedMaskId).toBeNull()
    })
  })

  describe('HOVER_MASK', () => {
    it('should set hover mask id', () => {
      const newState = occlusionReducer(state, {
        type: 'HOVER_MASK',
        payload: 'mask1',
      })

      expect(newState.editor.hoverMaskId).toBe('mask1')
    })

    it('should clear hover on null', () => {
      state.editor.hoverMaskId = 'mask1'

      const newState = occlusionReducer(state, {
        type: 'HOVER_MASK',
        payload: null,
      })

      expect(newState.editor.hoverMaskId).toBeNull()
    })
  })

  describe('START_DRAWING', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
    })

    it('should start drawing mode', () => {
      const mask: Mask = {
        id: 'temp',
        x: 50,
        y: 50,
        width: 0,
        height: 0,
        label: '',
        isVisible: true,
      }

      const newState = occlusionReducer(state, {
        type: 'START_DRAWING',
        payload: mask,
      })

      expect(newState.editor.isDrawing).toBe(true)
      expect(newState.editor.currentMask).toEqual(mask)
    })
  })

  describe('END_DRAWING', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'START_DRAWING',
        payload: {
          id: 'temp',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          label: '',
          isVisible: true,
        },
      })
    })

    it('should end drawing mode and add mask', () => {
      const newState = occlusionReducer(state, {
        type: 'END_DRAWING',
      })

      expect(newState.editor.isDrawing).toBe(false)
      expect(newState.editor.currentMask).toBeNull()
      expect(newState.occlusionData?.masks).toHaveLength(1)
    })
  })

  describe('UPDATE_CURRENT_MASK', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'START_DRAWING',
        payload: {
          id: 'temp',
          x: 50,
          y: 50,
          width: 0,
          height: 0,
          label: '',
          isVisible: true,
        },
      })
    })

    it('should update current mask properties', () => {
      const newState = occlusionReducer(state, {
        type: 'UPDATE_CURRENT_MASK',
        payload: {
          width: 100,
          height: 100,
        },
      })

      expect(newState.editor.currentMask?.width).toBe(100)
      expect(newState.editor.currentMask?.height).toBe(100)
      expect(newState.editor.currentMask?.x).toBe(50)
    })
  })

  describe('TOGGLE_MASK_VISIBILITY', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })
    })

    it('should toggle mask visibility', () => {
      expect(state.occlusionData?.masks[0].isVisible).toBe(true)

      const newState = occlusionReducer(state, {
        type: 'TOGGLE_MASK_VISIBILITY',
        payload: 'mask1',
      })

      expect(newState.occlusionData?.masks[0].isVisible).toBe(false)

      const finalState = occlusionReducer(newState, {
        type: 'TOGGLE_MASK_VISIBILITY',
        payload: 'mask1',
      })

      expect(finalState.occlusionData?.masks[0].isVisible).toBe(true)
    })
  })

  describe('UNDO', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })
    })

    it('should undo to previous state', () => {
      expect(state.occlusionData?.masks).toHaveLength(1)

      const newState = occlusionReducer(state, {
        type: 'UNDO',
      })

      expect(newState.occlusionData?.masks).toHaveLength(0)
    })

    it('should not undo beyond history start', () => {
      const newState = occlusionReducer(state, {
        type: 'UNDO',
      })

      const finalState = occlusionReducer(newState, {
        type: 'UNDO',
      })

      expect(finalState.historyIndex).toBe(newState.historyIndex)
    })

    it('should update history index', () => {
      const initialIndex = state.historyIndex

      const newState = occlusionReducer(state, {
        type: 'UNDO',
      })

      expect(newState.historyIndex).toBe(initialIndex - 1)
    })

    it('should clear selection on undo', () => {
      state.editor.selectedMaskId = 'mask1'

      const newState = occlusionReducer(state, {
        type: 'UNDO',
      })

      expect(newState.editor.selectedMaskId).toBeNull()
    })
  })

  describe('REDO', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })
      state = occlusionReducer(state, {
        type: 'UNDO',
      })
    })

    it('should redo to next state', () => {
      expect(state.occlusionData?.masks).toHaveLength(0)

      const newState = occlusionReducer(state, {
        type: 'REDO',
      })

      expect(newState.occlusionData?.masks).toHaveLength(1)
    })

    it('should not redo beyond history end', () => {
      state = occlusionReducer(state, {
        type: 'REDO',
      })

      const finalState = occlusionReducer(state, {
        type: 'REDO',
      })

      expect(finalState.historyIndex).toBe(state.historyIndex)
    })

    it('should update history index', () => {
      const initialIndex = state.historyIndex

      const newState = occlusionReducer(state, {
        type: 'REDO',
      })

      expect(newState.historyIndex).toBe(initialIndex + 1)
    })
  })

  describe('CLEAR_HISTORY', () => {
    beforeEach(() => {
      state = occlusionReducer(state, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })
      state = occlusionReducer(state, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })
    })

    it('should clear history and reset index', () => {
      const newState = occlusionReducer(state, {
        type: 'CLEAR_HISTORY',
      })

      expect(newState.history.length).toBe(1)
      expect(newState.historyIndex).toBe(0)
    })
  })

  describe('LOAD_OCCLUSION_DATA', () => {
    it('should load occlusion data', () => {
      const occlusionData = {
        imageId: 'img1',
        imagePath: '/test.jpg',
        imageWidth: 800,
        imageHeight: 600,
        masks: [
          {
            id: 'mask1',
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            label: 'Mask 1',
            isVisible: true,
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const newState = occlusionReducer(state, {
        type: 'LOAD_OCCLUSION_DATA',
        payload: occlusionData,
      })

      expect(newState.occlusionData).toEqual(occlusionData)
      expect(newState.occlusionData?.masks).toHaveLength(1)
    })

    it('should add to history', () => {
      const occlusionData = {
        imageId: 'img1',
        imagePath: '/test.jpg',
        imageWidth: 800,
        imageHeight: 600,
        masks: [
          {
            id: 'mask1',
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            label: 'Mask 1',
            isVisible: true,
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const previousHistoryLength = state.history.length
      const newState = occlusionReducer(state, {
        type: 'LOAD_OCCLUSION_DATA',
        payload: occlusionData,
      })

      expect(newState.history.length).toBeGreaterThan(previousHistoryLength)
    })
  })

  describe('Complex workflows', () => {
    it('should handle multiple operations and undo/redo', () => {
      // Load image
      const state1 = occlusionReducer(initialState, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })

      // Add mask 1
      const state2 = occlusionReducer(state1, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })

      // Add mask 2
      const state3 = occlusionReducer(state2, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask2',
          x: 200,
          y: 200,
          width: 100,
          height: 100,
          label: 'Mask 2',
          isVisible: true,
        },
      })

      expect(state3.occlusionData?.masks).toHaveLength(2)

      // Undo last add
      const state4 = occlusionReducer(state3, { type: 'UNDO' })
      expect(state4.occlusionData?.masks).toHaveLength(1)

      // Undo first add
      const state5 = occlusionReducer(state4, { type: 'UNDO' })
      expect(state5.occlusionData?.masks).toHaveLength(0)

      // Redo
      const state6 = occlusionReducer(state5, { type: 'REDO' })
      expect(state6.occlusionData?.masks).toHaveLength(1)

      // Redo again
      const state7 = occlusionReducer(state6, { type: 'REDO' })
      expect(state7.occlusionData?.masks).toHaveLength(2)
    })

    it('should handle mask operations', () => {
      // Load image
      const state1 = occlusionReducer(initialState, {
        type: 'LOAD_IMAGE',
        payload: { imagePath: '/test.jpg', width: 800, height: 600 },
      })

      // Add mask
      const state2 = occlusionReducer(state1, {
        type: 'ADD_MASK',
        payload: {
          id: 'mask1',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          label: 'Mask 1',
          isVisible: true,
        },
      })

      // Update mask
      const state3 = occlusionReducer(state2, {
        type: 'UPDATE_MASK',
        payload: {
          id: 'mask1',
          x: 50,
          y: 60,
          width: 150,
          height: 75,
          label: 'Updated',
          isVisible: true,
        },
      })

      expect(state3.occlusionData?.masks[0].x).toBe(50)
      expect(state3.occlusionData?.masks[0].label).toBe('Updated')

      // Toggle visibility
      const state4 = occlusionReducer(state3, {
        type: 'TOGGLE_MASK_VISIBILITY',
        payload: 'mask1',
      })

      expect(state4.occlusionData?.masks[0].isVisible).toBe(false)

      // Delete mask
      const state5 = occlusionReducer(state4, {
        type: 'DELETE_MASK',
        payload: 'mask1',
      })

      expect(state5.occlusionData?.masks).toHaveLength(0)
    })
  })
})
