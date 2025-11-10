import React, { useReducer, useCallback, FC } from 'react'
import {
  occlusionReducer,
  initialState,
} from '../reducers/occlusionReducer'
import {
  downloadOcclusionTemplate,
  importOcclusionTemplate,
  templateToOcclusionData,
} from '../utils/occlusionTemplateUtils'
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import OcclusionCanvas from './OcclusionCanvas'
import MaskPanel from './MaskPanel'
import styles from './OcclusionEditor.module.css'
import { Mask, OcclusionData } from '../types/occlusion'

export interface OcclusionEditorProps {
  imagePath?: string
  imageWidth?: number
  imageHeight?: number
  initialData?: OcclusionData
  onSave?: (data: OcclusionData) => void
  showPreview?: boolean
}

const OcclusionEditor: FC<OcclusionEditorProps> = ({
  imagePath = '',
  imageWidth = 0,
  imageHeight = 0,
  initialData,
  onSave,
  showPreview = false,
}) => {
  const [state, dispatch] = useReducer(occlusionReducer, initialState)

  // Initialize with image or data
  React.useEffect(() => {
    if (initialData) {
      dispatch({
        type: 'LOAD_OCCLUSION_DATA',
        payload: initialData,
      })
    } else if (imagePath && imageWidth > 0 && imageHeight > 0) {
      dispatch({
        type: 'LOAD_IMAGE',
        payload: {
          imagePath,
          width: imageWidth,
          height: imageHeight,
        },
      })
    }
  }, [imagePath, imageWidth, imageHeight, initialData])

  // Handlers
  const handleMaskStart = useCallback((x: number, y: number) => {
    const newMask: Mask = {
      id: `mask_${Date.now()}`,
      x,
      y,
      width: 0,
      height: 0,
      label: '',
      isVisible: true,
    }
    dispatch({ type: 'START_DRAWING', payload: newMask })
  }, [])

  const handleMaskUpdate = useCallback((updates: Partial<Mask>) => {
    dispatch({ type: 'UPDATE_CURRENT_MASK', payload: updates })
  }, [])

  const handleMaskEnd = useCallback(() => {
    if (
      state.editor.currentMask &&
      state.editor.currentMask.width >= 10 &&
      state.editor.currentMask.height >= 10
    ) {
      dispatch({ type: 'END_DRAWING' })
    } else {
      dispatch({ type: 'END_DRAWING' })
    }
  }, [state.editor.currentMask])

  const handleSelectMask = useCallback((maskId: string | null) => {
    dispatch({ type: 'SELECT_MASK', payload: maskId })
  }, [])

  const handleHoverMask = useCallback((maskId: string | null) => {
    dispatch({ type: 'HOVER_MASK', payload: maskId })
  }, [])

  const handleDeleteMask = useCallback((maskId: string) => {
    dispatch({ type: 'DELETE_MASK', payload: maskId })
  }, [])

  const handleUpdateMaskLabel = useCallback((maskId: string, label: string) => {
    const mask = state.occlusionData?.masks.find((m) => m.id === maskId)
    if (mask) {
      dispatch({
        type: 'UPDATE_MASK',
        payload: { ...mask, label },
      })
    }
  }, [state.occlusionData?.masks])

  const handleToggleMaskVisibility = useCallback((maskId: string) => {
    dispatch({ type: 'TOGGLE_MASK_VISIBILITY', payload: maskId })
  }, [])

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const handleMaskResize = useCallback(
    (maskId: string, x: number, y: number, width: number, height: number) => {
      const mask = state.occlusionData?.masks.find((m) => m.id === maskId)
      if (mask) {
        dispatch({
          type: 'UPDATE_MASK',
          payload: { ...mask, x, y, width, height },
        })
      }
    },
    [state.occlusionData?.masks]
  )

  const handleExport = useCallback(() => {
    if (state.occlusionData) {
      downloadOcclusionTemplate(state.occlusionData)
    }
  }, [state.occlusionData])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string
          const template = importOcclusionTemplate(jsonString)

          if (!state.occlusionData) return

          const occlusionData = templateToOcclusionData(
            template,
            state.occlusionData.imagePath
          )

          dispatch({
            type: 'LOAD_OCCLUSION_DATA',
            payload: {
              ...occlusionData,
              imageWidth: state.occlusionData.imageWidth,
              imageHeight: state.occlusionData.imageHeight,
            },
          })
        } catch (error) {
          console.error('Failed to import template:', error)
          alert(`Failed to import template: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [state.occlusionData])

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all masks?')) {
      if (state.occlusionData) {
        dispatch({
          type: 'LOAD_OCCLUSION_DATA',
          payload: {
            ...state.occlusionData,
            masks: [],
          },
        })
      }
    }
  }, [state.occlusionData])

  const handleSave = useCallback(() => {
    if (state.occlusionData && onSave) {
      onSave(state.occlusionData)
    }
  }, [state.occlusionData, onSave])

  // Setup keyboard shortcuts
  const shortcuts = {
    [KEYBOARD_SHORTCUTS.UNDO]: handleUndo,
    [KEYBOARD_SHORTCUTS.REDO]: handleRedo,
    [KEYBOARD_SHORTCUTS.DELETE]: () => {
      if (state.editor.selectedMaskId) {
        handleDeleteMask(state.editor.selectedMaskId)
      }
    },
    [KEYBOARD_SHORTCUTS.ESCAPE]: () => {
      handleSelectMask(null)
    },
  }

  useKeyboardShortcuts(shortcuts, !!state.occlusionData)

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.history.length - 1

  if (!state.occlusionData) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No image loaded. Please provide an image path and dimensions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.editorLayout}>
        <div className={styles.canvasWrapper}>
          <OcclusionCanvas
            imagePath={state.occlusionData.imagePath}
            imageWidth={state.occlusionData.imageWidth}
            imageHeight={state.occlusionData.imageHeight}
            masks={state.occlusionData.masks}
            selectedMaskId={state.editor.selectedMaskId}
            hoverMaskId={state.editor.hoverMaskId}
            isDrawing={state.editor.isDrawing}
            currentMask={state.editor.currentMask}
            onMaskStart={handleMaskStart}
            onMaskUpdate={handleMaskUpdate}
            onMaskEnd={handleMaskEnd}
            onMaskSelect={handleSelectMask}
            onMaskHover={handleHoverMask}
            onMaskResize={handleMaskResize}
            showPreview={showPreview}
          />
        </div>

        <MaskPanel
          masks={state.occlusionData.masks}
          selectedMaskId={state.editor.selectedMaskId}
          onSelectMask={handleSelectMask}
          onDeleteMask={handleDeleteMask}
          onUpdateMaskLabel={handleUpdateMaskLabel}
          onToggleMaskVisibility={handleToggleMaskVisibility}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClear}
        />
      </div>

      {onSave && (
        <div className={styles.footer}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save Occlusion Data
          </button>
        </div>
      )}
    </div>
  )
}

export default OcclusionEditor
