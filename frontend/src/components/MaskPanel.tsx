import React, { FC, useState } from 'react'
import { Mask } from '../types/occlusion'
import styles from './MaskPanel.module.css'

export interface MaskPanelProps {
  masks: Mask[]
  selectedMaskId: string | null
  onSelectMask: (maskId: string | null) => void
  onDeleteMask: (maskId: string) => void
  onUpdateMaskLabel: (maskId: string, label: string) => void
  onToggleMaskVisibility: (maskId: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  onImport: () => void
  onClear: () => void
}

const MaskPanel: FC<MaskPanelProps> = ({
  masks,
  selectedMaskId,
  onSelectMask,
  onDeleteMask,
  onUpdateMaskLabel,
  onToggleMaskVisibility,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onClear,
}) => {
  const [editingMaskId, setEditingMaskId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const handleStartEdit = (mask: Mask) => {
    setEditingMaskId(mask.id)
    setEditingLabel(mask.label)
  }

  const handleFinishEdit = (maskId: string) => {
    if (editingLabel.trim()) {
      onUpdateMaskLabel(maskId, editingLabel)
    }
    setEditingMaskId(null)
    setEditingLabel('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, maskId: string) => {
    if (e.key === 'Enter') {
      handleFinishEdit(maskId)
    } else if (e.key === 'Escape') {
      setEditingMaskId(null)
      setEditingLabel('')
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Masks</h3>
        <span className={styles.count}>{masks.length}</span>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          className={styles.btn}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
        <button className={styles.btn} onClick={onExport} title="Export template">
          ↓ Export
        </button>
        <button className={styles.btn} onClick={onImport} title="Import template">
          ↑ Import
        </button>
        <button
          className={styles.btn}
          onClick={onClear}
          disabled={masks.length === 0}
          title="Clear all masks"
        >
          × Clear
        </button>
      </div>

      <div className={styles.maskList}>
        {masks.length === 0 ? (
          <div className={styles.empty}>No masks yet. Draw on the canvas.</div>
        ) : (
          masks.map((mask) => (
            <div
              key={mask.id}
              className={`${styles.maskItem} ${
                mask.id === selectedMaskId ? styles.selected : ''
              }`}
              onClick={() => onSelectMask(mask.id)}
            >
              <div className={styles.maskInfo}>
                <input
                  type="checkbox"
                  className={styles.visibility}
                  checked={mask.isVisible}
                  onChange={() => onToggleMaskVisibility(mask.id)}
                  onClick={(e) => e.stopPropagation()}
                  title="Toggle visibility"
                />
                {editingMaskId === mask.id ? (
                  <input
                    type="text"
                    className={styles.labelInput}
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => handleFinishEdit(mask.id)}
                    onKeyDown={(e) => handleKeyDown(e, mask.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={styles.label}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit(mask)
                    }}
                  >
                    {mask.label || 'Untitled'}
                  </span>
                )}
              </div>
              <div className={styles.maskDimensions}>
                <small>
                  {Math.round(mask.width)} × {Math.round(mask.height)}
                </small>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteMask(mask.id)
                }}
                title="Delete mask"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MaskPanel
