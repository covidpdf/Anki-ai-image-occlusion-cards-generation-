/**
 * Represents a single mask rectangle on an image
 */
export interface Mask {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  isVisible: boolean
}

/**
 * Represents the occlusion data for a single image
 */
export interface OcclusionData {
  imageId: string
  imagePath: string
  imageWidth: number
  imageHeight: number
  masks: Mask[]
  createdAt: string
  updatedAt: string
}

/**
 * Represents the editor state including masks and interaction state
 */
export interface EditorState {
  currentMask: Mask | null
  isDrawing: boolean
  selectedMaskId: string | null
  hoverMaskId: string | null
}

/**
 * Represents a single history entry for undo/redo
 */
export interface HistoryEntry {
  masks: Mask[]
  timestamp: number
}

/**
 * Represents the complete occlusion editor state
 */
export interface OcclusionEditorState {
  occlusionData: OcclusionData | null
  editor: EditorState
  history: HistoryEntry[]
  historyIndex: number
}

/**
 * Action types for the reducer
 */
export type OcclusionAction =
  | { type: 'LOAD_IMAGE'; payload: { imagePath: string; width: number; height: number } }
  | { type: 'ADD_MASK'; payload: Mask }
  | { type: 'UPDATE_MASK'; payload: Mask }
  | { type: 'DELETE_MASK'; payload: string }
  | { type: 'SELECT_MASK'; payload: string | null }
  | { type: 'HOVER_MASK'; payload: string | null }
  | { type: 'START_DRAWING'; payload: Mask }
  | { type: 'END_DRAWING' }
  | { type: 'UPDATE_CURRENT_MASK'; payload: Partial<Mask> }
  | { type: 'TOGGLE_MASK_VISIBILITY'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'LOAD_OCCLUSION_DATA'; payload: OcclusionData }

/**
 * Represents an exported occlusion template
 */
export interface OcclusionTemplate {
  version: string
  createdAt: string
  imageDimensions: { width: number; height: number }
  masks: Array<Omit<Mask, 'id' | 'isVisible'>>
}
