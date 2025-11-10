import {
  OcclusionEditorState,
  OcclusionAction,
  Mask,
  OcclusionData,
  HistoryEntry,
} from '../types/occlusion'

/**
 * Generate a unique ID for masks
 */
function generateId(): string {
  return `mask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current masks from state
 */
function getCurrentMasks(state: OcclusionEditorState): Mask[] {
  return state.occlusionData?.masks || []
}

/**
 * Create a new history entry
 */
function createHistoryEntry(masks: Mask[]): HistoryEntry {
  return { masks: JSON.parse(JSON.stringify(masks)), timestamp: Date.now() }
}

/**
 * Add entry to history and manage history state
 */
function addToHistory(
  state: OcclusionEditorState,
  masks: Mask[]
): {
  history: HistoryEntry[]
  historyIndex: number
} {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(createHistoryEntry(masks))

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

/**
 * Initial state
 */
export const initialState: OcclusionEditorState = {
  occlusionData: null,
  editor: {
    currentMask: null,
    isDrawing: false,
    selectedMaskId: null,
    hoverMaskId: null,
  },
  history: [],
  historyIndex: -1,
}

/**
 * Main reducer for occlusion editor state
 */
export function occlusionReducer(
  state: OcclusionEditorState,
  action: OcclusionAction
): OcclusionEditorState {
  switch (action.type) {
    case 'LOAD_IMAGE': {
      const imageId = `img_${Date.now()}`
      const newOcclusionData: OcclusionData = {
        imageId,
        imagePath: action.payload.imagePath,
        imageWidth: action.payload.width,
        imageHeight: action.payload.height,
        masks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        ...state,
        occlusionData: newOcclusionData,
        editor: {
          ...state.editor,
          selectedMaskId: null,
          currentMask: null,
        },
        history: [createHistoryEntry([])],
        historyIndex: 0,
      }
    }

    case 'ADD_MASK': {
      if (!state.occlusionData) return state

      const maskWithId: Mask = {
        ...action.payload,
        id: action.payload.id || generateId(),
      }

      const newMasks = [...getCurrentMasks(state), maskWithId]
      const { history, historyIndex } = addToHistory(state, newMasks)

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: newMasks,
          updatedAt: new Date().toISOString(),
        },
        editor: {
          ...state.editor,
          selectedMaskId: maskWithId.id,
        },
        history,
        historyIndex,
      }
    }

    case 'UPDATE_MASK': {
      if (!state.occlusionData) return state

      const masks = getCurrentMasks(state)
      const updatedMasks = masks.map((mask) =>
        mask.id === action.payload.id ? action.payload : mask
      )

      const { history, historyIndex } = addToHistory(state, updatedMasks)

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: updatedMasks,
          updatedAt: new Date().toISOString(),
        },
        history,
        historyIndex,
      }
    }

    case 'DELETE_MASK': {
      if (!state.occlusionData) return state

      const masks = getCurrentMasks(state)
      const updatedMasks = masks.filter((mask) => mask.id !== action.payload)

      const { history, historyIndex } = addToHistory(state, updatedMasks)

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: updatedMasks,
          updatedAt: new Date().toISOString(),
        },
        editor: {
          ...state.editor,
          selectedMaskId:
            state.editor.selectedMaskId === action.payload
              ? null
              : state.editor.selectedMaskId,
        },
        history,
        historyIndex,
      }
    }

    case 'SELECT_MASK': {
      return {
        ...state,
        editor: {
          ...state.editor,
          selectedMaskId: action.payload,
        },
      }
    }

    case 'HOVER_MASK': {
      return {
        ...state,
        editor: {
          ...state.editor,
          hoverMaskId: action.payload,
        },
      }
    }

    case 'START_DRAWING': {
      return {
        ...state,
        editor: {
          ...state.editor,
          isDrawing: true,
          currentMask: action.payload,
        },
      }
    }

    case 'END_DRAWING': {
      const { currentMask } = state.editor

      if (!currentMask || !state.occlusionData) {
        return {
          ...state,
          editor: {
            ...state.editor,
            isDrawing: false,
            currentMask: null,
          },
        }
      }

      const newMasks = [...getCurrentMasks(state), currentMask]
      const { history, historyIndex } = addToHistory(state, newMasks)

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: newMasks,
          updatedAt: new Date().toISOString(),
        },
        editor: {
          ...state.editor,
          isDrawing: false,
          currentMask: null,
          selectedMaskId: currentMask.id,
        },
        history,
        historyIndex,
      }
    }

    case 'UPDATE_CURRENT_MASK': {
      if (!state.editor.currentMask) return state

      return {
        ...state,
        editor: {
          ...state.editor,
          currentMask: {
            ...state.editor.currentMask,
            ...action.payload,
          },
        },
      }
    }

    case 'TOGGLE_MASK_VISIBILITY': {
      if (!state.occlusionData) return state

      const masks = getCurrentMasks(state)
      const updatedMasks = masks.map((mask) =>
        mask.id === action.payload
          ? { ...mask, isVisible: !mask.isVisible }
          : mask
      )

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: updatedMasks,
          updatedAt: new Date().toISOString(),
        },
      }
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state

      const newIndex = state.historyIndex - 1
      const historyEntry = state.history[newIndex]

      if (!state.occlusionData || !historyEntry) return state

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: JSON.parse(JSON.stringify(historyEntry.masks)),
          updatedAt: new Date().toISOString(),
        },
        editor: {
          ...state.editor,
          selectedMaskId: null,
        },
        historyIndex: newIndex,
      }
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state

      const newIndex = state.historyIndex + 1
      const historyEntry = state.history[newIndex]

      if (!state.occlusionData || !historyEntry) return state

      return {
        ...state,
        occlusionData: {
          ...state.occlusionData,
          masks: JSON.parse(JSON.stringify(historyEntry.masks)),
          updatedAt: new Date().toISOString(),
        },
        editor: {
          ...state.editor,
          selectedMaskId: null,
        },
        historyIndex: newIndex,
      }
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [createHistoryEntry(getCurrentMasks(state))],
        historyIndex: 0,
      }
    }

    case 'LOAD_OCCLUSION_DATA': {
      const { history, historyIndex } = addToHistory(
        state,
        action.payload.masks
      )

      return {
        ...state,
        occlusionData: action.payload,
        editor: {
          ...state.editor,
          selectedMaskId: null,
          currentMask: null,
        },
        history,
        historyIndex,
      }
    }

    default:
      return state
  }
}
