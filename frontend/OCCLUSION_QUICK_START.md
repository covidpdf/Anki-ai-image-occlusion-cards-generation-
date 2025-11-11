# Quick Start: Image Occlusion Editor

## Installation

1. Ensure dependencies are installed:
```bash
cd frontend
pnpm install
```

## Running the Editor

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Basic Usage

1. **Upload an Image**: The editor displays the image at the top
2. **Draw Masks**: Click and drag on the image to create rectangular masks
3. **Label Masks**: Double-click a mask label in the right panel to rename it
4. **Resize**: Select a mask and drag any resize handle to adjust size
5. **Move**: Select a mask and drag it to reposition
6. **Delete**: Select a mask and press Delete or click the × button

## Keyboard Shortcuts

- `Ctrl+Z` (Cmd+Z on Mac): Undo
- `Ctrl+Y` (Cmd+Y on Mac): Redo
- `Delete`: Delete selected mask
- `Escape`: Deselect mask

## Export/Import

### Export
1. Click "↓ Export" button
2. A JSON file will be downloaded with all mask data

### Import
1. Click "↑ Import" button
2. Select a previously exported JSON file
3. Masks will be loaded onto the current image

## Visibility Toggle

Check/uncheck the eye icon next to any mask to hide/show it:
- Unchecked masks are hidden
- Useful for seeing different layers
- Toggle "Preview" mode to see occluded areas in black

## Preview Mode

When preview mode is enabled:
- Masked areas appear as black overlays
- Useful for checking occlusion coverage
- Mask labels and controls are hidden

## Saving

1. Make your changes to masks
2. Click "Save Occlusion Data" button
3. Data is saved to the application state
4. Export to download as JSON for persistence

## Tips & Tricks

- **Min Size**: Masks must be at least 10×10 pixels
- **Exact Positioning**: Use drag handles for precise adjustments
- **Bulk Delete**: Click "× Clear" to remove all masks at once
- **History**: Full undo/redo history preserves your work

## Testing

Run the test suite:
```bash
pnpm test          # Interactive mode
pnpm test -- --run # Single run
```

Test coverage includes:
- 33 reducer tests (state management)
- 24 utility tests (export/import)
- 5 hook tests (keyboard shortcuts)

## Development

### Project Structure
```
src/
├── components/
│   ├── OcclusionCanvas.tsx    # Canvas drawing interface
│   ├── OcclusionEditor.tsx    # Main orchestrator component
│   └── MaskPanel.tsx          # Mask management panel
├── reducers/
│   ├── occlusionReducer.ts    # State management
│   └── occlusionReducer.test.ts
├── hooks/
│   ├── useKeyboardShortcuts.ts # Keyboard handling
│   └── useKeyboardShortcuts.test.ts
├── types/
│   └── occlusion.ts           # TypeScript definitions
└── utils/
    ├── occlusionTemplateUtils.ts # Export/import logic
    └── occlusionTemplateUtils.test.ts
```

### Making Changes

1. **Add a Feature**:
   - Update types in `src/types/occlusion.ts`
   - Add reducer action in `src/reducers/occlusionReducer.ts`
   - Update component in `src/components/OcclusionEditor.tsx`
   - Write tests in `.test.ts` files

2. **Run Quality Checks**:
   ```bash
   pnpm type-check  # TypeScript checks
   pnpm lint       # ESLint & Prettier
   pnpm test       # Tests
   pnpm build      # Production build
   ```

## Troubleshooting

### Image Not Loading
- Check image URL is correct and accessible
- Verify CORS headers if loading from different domain
- Check browser console for errors

### Masks Disappearing
- Check "Visibility" toggle in mask panel
- Try undoing recent changes (Ctrl+Z)
- Refresh the page if corrupted

### Performance Issues
- Reduce number of masks on single image
- Use smaller image dimensions
- Clear browser cache and reload

### Import Failing
- Ensure JSON file is valid template format
- Check file matches expected structure
- Verify template version is compatible

## API Reference

See `OCCLUSION_EDITOR.md` for:
- Complete component prop documentation
- Reducer action specifications
- Utility function examples
- Type definitions and interfaces

## Contributing

When adding new features:
1. Maintain TypeScript strict mode
2. Add comprehensive tests (aim for 100% coverage)
3. Update this documentation
4. Ensure ESLint/Prettier checks pass
5. Test across browsers

## License

See LICENSE file in project root.
