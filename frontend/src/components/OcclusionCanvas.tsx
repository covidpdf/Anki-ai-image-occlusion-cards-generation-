import React, { useRef, useEffect, useState, FC, useCallback } from 'react'
import { Mask } from '../types/occlusion'
import styles from './OcclusionCanvas.module.css'

export interface OcclusionCanvasProps {
  imagePath: string
  imageWidth: number
  imageHeight: number
  masks: Mask[]
  selectedMaskId: string | null
  hoverMaskId: string | null
  isDrawing: boolean
  currentMask: Mask | null
  onMaskStart: (x: number, y: number) => void
  onMaskUpdate: (mask: Partial<Mask>) => void
  onMaskEnd: () => void
  onMaskSelect: (maskId: string | null) => void
  onMaskHover: (maskId: string | null) => void
  onMaskResize: (maskId: string, x: number, y: number, width: number, height: number) => void
  showPreview?: boolean
}

const HANDLE_SIZE = 8
const MIN_MASK_SIZE = 10

interface ResizeHandle {
  cursor: string
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startTop: number
  startLeft: number
}

const OcclusionCanvas: FC<OcclusionCanvasProps> = ({
  imagePath,
  imageWidth,
  imageHeight,
  masks,
  selectedMaskId,
  hoverMaskId,
  isDrawing,
  currentMask,
  onMaskStart,
  onMaskUpdate,
  onMaskEnd,
  onMaskSelect,
  onMaskHover,
  onMaskResize,
  showPreview = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null)
  const [draggedMaskId, setDraggedMaskId] = useState<string | null>(null)

  // Calculate scale to fit image in container
  const calculateScale = useCallback(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const scaleValue = containerWidth / imageWidth
    setScale(Math.min(scaleValue, 1))
  }, [imageWidth])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImage(img)
      calculateScale()
    }
    img.onerror = () => {
      console.error(`Failed to load image: ${imagePath}`)
    }
    img.src = imagePath
  }, [imagePath, calculateScale])

  // Draw on canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const displayWidth = imageWidth * scale
    const displayHeight = imageHeight * scale
    canvas.width = displayWidth
    canvas.height = displayHeight

    // Draw image
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight)

    // Draw masks
    masks.forEach((mask) => {
      if (showPreview && !mask.isVisible) return

      const x = mask.x * scale
      const y = mask.y * scale
      const w = mask.width * scale
      const h = mask.height * scale

      // Draw mask rectangle
      ctx.fillStyle = showPreview ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 0, 0, 0.2)'
      ctx.fillRect(x, y, w, h)

      // Draw border
      const isSelected = mask.id === selectedMaskId
      const isHovered = mask.id === hoverMaskId
      ctx.strokeStyle = isSelected ? '#ff0000' : isHovered ? '#ff6600' : '#ff0000'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.strokeRect(x, y, w, h)

      // Draw label
      if (mask.label && !showPreview) {
        ctx.fillStyle = '#000000'
        ctx.font = `12px Arial`
        ctx.fillText(mask.label, x + 4, y + 16)
      }
    })

    // Draw current mask being drawn
    if (isDrawing && currentMask) {
      const x = currentMask.x * scale
      const y = currentMask.y * scale
      const w = currentMask.width * scale
      const h = currentMask.height * scale

      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
      ctx.fillRect(x, y, w, h)

      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])
    }

    // Draw resize handles for selected mask
    if (selectedMaskId) {
      const selectedMask = masks.find((m) => m.id === selectedMaskId)
      if (selectedMask) {
        const x = selectedMask.x * scale
        const y = selectedMask.y * scale
        const w = selectedMask.width * scale
        const h = selectedMask.height * scale

        drawResizeHandles(ctx, x, y, w, h)
      }
    }
  }, [image, scale, masks, selectedMaskId, hoverMaskId, isDrawing, currentMask, showPreview, imageWidth, imageHeight])

  const drawResizeHandles = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const handles = [
      [x, y],
      [x + w / 2, y],
      [x + w, y],
      [x + w, y + h / 2],
      [x + w, y + h],
      [x + w / 2, y + h],
      [x, y + h],
      [x, y + h / 2],
    ]

    handles.forEach(([hx, hy]) => {
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.strokeRect(hx - HANDLE_SIZE / 2, hy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
    })
  }

  const getResizeHandleAtPoint = (
    x: number,
    y: number,
    maskX: number,
    maskY: number,
    maskW: number,
    maskH: number
  ): ResizeHandle | null => {
    const scaledX = x / scale
    const scaledY = y / scale

    const handles = {
      nw: [maskX, maskY],
      n: [maskX + maskW / 2, maskY],
      ne: [maskX + maskW, maskY],
      e: [maskX + maskW, maskY + maskH / 2],
      se: [maskX + maskW, maskY + maskH],
      s: [maskX + maskW / 2, maskY + maskH],
      sw: [maskX, maskY + maskH],
      w: [maskX, maskY + maskH / 2],
    }

    const tolerance = HANDLE_SIZE / scale

    for (const [cursor, [hx, hy]] of Object.entries(handles)) {
      if (Math.abs(scaledX - hx) < tolerance && Math.abs(scaledY - hy) < tolerance) {
        return {
          cursor: cursor === 'nw' || cursor === 'se' ? 'nwse-resize' : cursor === 'ne' || cursor === 'sw' ? 'nesw-resize' : cursor.endsWith('w') || cursor.endsWith('e') ? 'ew-resize' : 'ns-resize',
          startX: scaledX,
          startY: scaledY,
          startWidth: maskW,
          startHeight: maskH,
          startTop: maskY,
          startLeft: maskX,
        }
      }
    }

    return null
  }

  const getSelectedMask = (): Mask | undefined => {
    return masks.find((m) => m.id === selectedMaskId)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scaledX = x / scale
    const scaledY = y / scale

    const selectedMask = getSelectedMask()

    // Check if clicking on resize handle
    if (selectedMask) {
      const handle = getResizeHandleAtPoint(
        x,
        y,
        selectedMask.x,
        selectedMask.y,
        selectedMask.width,
        selectedMask.height
      )
      if (handle) {
        setResizeHandle(handle)
        return
      }

      // Check if clicking on selected mask
      if (
        scaledX >= selectedMask.x &&
        scaledX <= selectedMask.x + selectedMask.width &&
        scaledY >= selectedMask.y &&
        scaledY <= selectedMask.y + selectedMask.height
      ) {
        setDraggedMaskId(selectedMask.id)
        return
      }
    }

    // Check if clicking on other masks
    for (const mask of masks) {
      if (
        scaledX >= mask.x &&
        scaledX <= mask.x + mask.width &&
        scaledY >= mask.y &&
        scaledY <= mask.y + mask.height
      ) {
        onMaskSelect(mask.id)
        return
      }
    }

    // Start drawing new mask
    onMaskSelect(null)
    onMaskStart(scaledX, scaledY)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scaledX = x / scale
    const scaledY = y / scale

    // Handle resizing
    if (resizeHandle && selectedMaskId) {
      const selectedMask = getSelectedMask()
      if (!selectedMask) return

      const deltaX = scaledX - resizeHandle.startX
      const deltaY = scaledY - resizeHandle.startY

      let newX = selectedMask.x
      let newY = selectedMask.y
      let newWidth = resizeHandle.startWidth
      let newHeight = resizeHandle.startHeight

      if (resizeHandle.cursor.includes('w')) {
        newX = resizeHandle.startLeft + deltaX
        newWidth = resizeHandle.startWidth - deltaX
      }
      if (resizeHandle.cursor.includes('e')) {
        newWidth = resizeHandle.startWidth + deltaX
      }
      if (resizeHandle.cursor.includes('n')) {
        newY = resizeHandle.startTop + deltaY
        newHeight = resizeHandle.startHeight - deltaY
      }
      if (resizeHandle.cursor.includes('s')) {
        newHeight = resizeHandle.startHeight + deltaY
      }

      if (newWidth >= MIN_MASK_SIZE && newHeight >= MIN_MASK_SIZE) {
        onMaskResize(selectedMask.id, newX, newY, newWidth, newHeight)
      }
      return
    }

    // Handle dragging
    if (draggedMaskId && selectedMaskId === draggedMaskId) {
      const selectedMask = getSelectedMask()
      if (!selectedMask) return

      const deltaX = scaledX - (selectedMask.x + selectedMask.width / 2)
      const deltaY = scaledY - (selectedMask.y + selectedMask.height / 2)

      const newX = Math.max(0, Math.min(imageWidth - selectedMask.width, selectedMask.x + deltaX))
      const newY = Math.max(0, Math.min(imageHeight - selectedMask.height, selectedMask.y + deltaY))

      onMaskResize(selectedMask.id, newX, newY, selectedMask.width, selectedMask.height)
      return
    }

    // Handle drawing
    if (isDrawing) {
      const width = scaledX - (currentMask?.x || 0)
      const height = scaledY - (currentMask?.y || 0)

      if (Math.abs(width) >= 1 && Math.abs(height) >= 1) {
        const finalX = Math.min(currentMask?.x || 0, scaledX)
        const finalY = Math.min(currentMask?.y || 0, scaledY)
        const finalWidth = Math.abs(width)
        const finalHeight = Math.abs(height)

        onMaskUpdate({
          x: finalX,
          y: finalY,
          width: finalWidth,
          height: finalHeight,
        })
      }
      return
    }

    // Update hover state
    let hoveredMaskId: string | null = null
    for (const mask of masks) {
      if (
        scaledX >= mask.x &&
        scaledX <= mask.x + mask.width &&
        scaledY >= mask.y &&
        scaledY <= mask.y + mask.height
      ) {
        hoveredMaskId = mask.id
        break
      }
    }
    onMaskHover(hoveredMaskId)

    // Update cursor
    if (hoveredMaskId === selectedMaskId && selectedMaskId) {
      const selectedMask = getSelectedMask()
      if (selectedMask) {
        const handle = getResizeHandleAtPoint(
          x,
          y,
          selectedMask.x,
          selectedMask.y,
          selectedMask.width,
          selectedMask.height
        )
        if (handle) {
          canvasRef.current.style.cursor = handle.cursor
          return
        }
      }
    }

    canvasRef.current.style.cursor = hoveredMaskId ? 'pointer' : 'crosshair'
  }

  const handleCanvasMouseUp = () => {
    if (resizeHandle) {
      setResizeHandle(null)
    } else if (draggedMaskId) {
      setDraggedMaskId(null)
    } else if (isDrawing) {
      onMaskEnd()
    }
  }

  const handleCanvasMouseLeave = () => {
    onMaskHover(null)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
      />
    </div>
  )
}

export default OcclusionCanvas
