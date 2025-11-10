# Image Occlusion Editor

## Overview

The Image Occlusion Editor is a comprehensive canvas-based tool that enables users to draw, resize, label, and manage mask rectangles on images. It includes full undo/redo support, keyboard shortcuts, multi-mask management, and import/export functionality for occlusion templates.

## Features

### Core Functionality

- **Draw Masks**: Click and drag on the canvas to draw rectangular masks
- **Resize Masks**: Select a mask and drag its resize handles to adjust dimensions
- **Move Masks**: Drag selected masks to reposition them on the image
- **Label Masks**: Double-click on a mask label to edit its name
- **Delete Masks**: Press Delete key or click the delete button in the mask panel
- **Visibility Toggle**: Show/hide individual masks or preview the result

### Advanced Features

- **Multi-mask Support**: Handle unlimited masks on a single image
- **Undo/Redo History**: Full history stack for all mask operations
- **Keyboard Shortcuts**: 
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Y` / `Cmd+Y`: Redo
  - `Delete`: Delete selected mask
  - `Escape`: Deselect current mask
- **Export/Import**: Save and load occlusion templates as JSON
- **Preview Mode**: Toggle preview to see masked areas in black
- **State Persistence**: All metadata stored with source image coordinates

## Architecture

### Type Definitions (`src/types/occlusion.ts`)

```typescript
// A single mask rectangle
interface Mask {
  id: string
  x: number           // X coordinate in original image
  y: number           // Y coordinate in original image
  width: number       // Width in original image
  height: number      // Height in original image
  label: string       // User-defined label
  isVisible: boolean  // Visibility toggle
}

// Complete occlusion data for an image
interface OcclusionData {
  imageId: string
  imagePath: string
  imageWidth: number
  imageHeight: number
  masks: Mask[]
  createdAt: string
  updatedAt: string
}

// Exported template format
interface OcclusionTemplate {
  version: string
  createdAt: string
  imageDimensions: { width: number; height: number }
  masks: Array<Omit<Mask, 'id' | 'isVisible'>>
}
```

### State Management (`src/reducers/occlusionReducer.ts`)

A pure reducer function manages all state changes with full type safety:

```typescript
// Main actions
- LOAD_IMAGE: Initialize with image dimensions
- ADD_MASK: Add new mask
- UPDATE_MASK: Modify existing mask
- DELETE_MASK: Remove mask
- SELECT_MASK: Set selected mask
- HOVER_MASK: Track mouse hover
- START_DRAWING: Begin drawing new mask
- END_DRAWING: Complete mask drawing
- UPDATE_CURRENT_MASK: Update mask being drawn
- TOGGLE_MASK_VISIBILITY: Show/hide mask
- UNDO: Undo last action
- REDO: Redo last undone action
- CLEAR_HISTORY: Reset history
- LOAD_OCCLUSION_DATA: Import occlusion data
```

### Components

#### OcclusionEditor (`src/components/OcclusionEditor.tsx`)
Main component orchestrating the editor. Props:

```typescript
interface OcclusionEditorProps {
  imagePath?: string           // Image URL
  imageWidth?: number          // Original image width
  imageHeight?: number         // Original image height
  initialData?: OcclusionData  // Pre-loaded occlusion data
  onSave?: (data: OcclusionData) => void  // Save callback
  showPreview?: boolean        // Toggle preview mode
}
```

#### OcclusionCanvas (`src/components/OcclusionCanvas.tsx`)
Canvas-based drawing interface with:
- Mouse event handling for drawing and resizing
- Real-time canvas rendering
- Resize handle visualization
- Scale calculation for responsive sizing
- Crosshair cursor feedback

#### MaskPanel (`src/components/MaskPanel.tsx`)
Side panel with:
- Mask list with dimensions
- Visibility toggle for each mask
- Inline label editing
- Delete buttons
- Undo/Redo controls
- Export/Import buttons
- Clear all masks button

### Utilities

#### occlusionTemplateUtils (`src/utils/occlusionTemplateUtils.ts`)

```typescript
// Export occlusion data to JSON string
exportOcclusionTemplate(data: OcclusionData): string

// Download template as JSON file
downloadOcclusionTemplate(data: OcclusionData, filename?: string): void

// Import template from JSON string
importOcclusionTemplate(json: string): OcclusionTemplate

// Convert template to OcclusionData
templateToOcclusionData(template: OcclusionTemplate, imagePath: string): OcclusionData

// Validate occlusion data structure
validateOcclusionData(data: OcclusionData): boolean

// Deep clone occlusion data
cloneOcclusionData(data: OcclusionData): OcclusionData
```

#### useKeyboardShortcuts (`src/hooks/useKeyboardShortcuts.ts`)

Custom React hook for handling keyboard shortcuts:

```typescript
useKeyboardShortcuts(shortcuts: KeyboardShortcutConfig, enabled?: boolean): void

// Predefined shortcuts
KEYBOARD_SHORTCUTS = {
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  DELETE: 'delete',
  BACKSPACE: 'backspace',
  ESCAPE: 'escape',
  ENTER: 'enter',
  SPACE: 'space',
  SELECT_ALL: 'ctrl+a',
}
```

## Usage

### Basic Setup

```tsx
import OcclusionEditor from './components/OcclusionEditor'

function App() {
  const handleSave = (data) => {
    console.log('Saved:', data)
  }

  return (
    <OcclusionEditor
      imagePath="/path/to/image.jpg"
      imageWidth={800}
      imageHeight={600}
      onSave={handleSave}
    />
  )
}
```

### With Initial Data

```tsx
const initialData = {
  imageId: 'img1',
  imagePath: '/path/to/image.jpg',
  imageWidth: 800,
  imageHeight: 600,
  masks: [
    {
      id: 'mask1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      label: 'Important Text',
      isVisible: true,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

<OcclusionEditor
  initialData={initialData}
  onSave={handleSave}
/>
```

### Export Template

Users can export masks as a JSON template:

```json
{
  "version": "1.0.0",
  "createdAt": "2024-01-01T00:00:00Z",
  "imageDimensions": {
    "width": 800,
    "height": 600
  },
  "masks": [
    {
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 50,
      "label": "Important Text"
    }
  ]
}
```

## Testing

Comprehensive test suite with 62 tests covering:

### Reducer Tests (33 tests)
- Image loading and initialization
- Mask CRUD operations
- Selection and hover states
- Drawing workflow
- Resizing operations
- Undo/Redo functionality
- Complex state transitions

### Utility Tests (24 tests)
- Export/Import round-trip conversion
- Template validation
- Data cloning
- Error handling

### Hook Tests (5 tests)
- Keyboard shortcut registration
- Enable/disable functionality
- Multiple shortcuts handling
- Default prevention
- Predefined shortcut keys

Run tests with: `pnpm test`

## Performance Considerations

- Canvas rendering optimized with efficient DOM updates
- Memoized functions prevent unnecessary re-renders
- Scale calculation caches for responsive resizing
- Efficient history management with O(1) access
- Lightweight dependencies (React only)

## Browser Support

- Modern browsers with Canvas API support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Limitations

- Maximum mask size limited by canvas dimensions
- Performance optimal for <100 masks per image
- Template export limited to local file download
- No collaborative editing support

## Future Enhancements

- Mask shape variations (circles, polygons, freeform)
- Mask rotation and advanced transformations
- Batch operations (select multiple, move together)
- Template library and sharing
- Undo/Redo limits and memory management
- Cloud sync and autosave
- Annotation features (text boxes, arrows)
- Occlusion pattern variations

## Error Handling

The editor includes robust error handling for:
- Invalid image paths (logged to console)
- Malformed template imports (user alert)
- Missing required mask properties (validation)
- Canvas context initialization failures

## Accessibility

- Keyboard navigation support
- Clear visual feedback for selections
- Semantic HTML structure
- Proper contrast ratios for UI elements

## Code Quality

- 100% TypeScript strict mode
- ESLint all checks passing
- Prettier formatting enforced
- Full test coverage for core logic
- No console warnings or errors
