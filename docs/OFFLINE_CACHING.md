# Offline Caching and PWA Features

This document describes the offline caching capabilities and Progressive Web App (PWA) features of the Anki Image Occlusion Generator.

## Overview

The application now includes comprehensive offline support through:

- **Service Worker**: Handles caching of static assets and API responses
- **IndexedDB**: Local persistent storage for decks, OCR results, and occlusion metadata
- **Background Sync**: Queue exports and sync them when the connection is restored
- **PWA Installability**: Full support for installation as a standalone app on mobile and desktop
- **Offline Indicator**: Visual feedback showing the current network status

## Features

### 1. Service Worker & Caching

The application uses Workbox to manage service worker functionality:

#### Static Asset Caching
- All JavaScript, CSS, HTML, images, and fonts are cached on first visit
- Cached assets are served immediately, even offline
- Updates are detected and available next visit

#### API Response Caching
- API calls are cached with a Network First strategy
- If the network is unavailable, cached responses are used
- Cache expires after 5 minutes for fresh data on reconnection

### 2. IndexedDB Local Storage

Four main data stores are available:

#### Decks Store
- Stores deck metadata (name, description, card count)
- Indexed by deck ID
- Supports full CRUD operations

#### OCR Results Store
- Stores OCR recognition results with confidence scores
- Indexed by deck ID for quick filtering
- Keeps image URL and extracted text

#### Occlusion Metadata Store
- Stores occlusion region definitions (coordinates, labels)
- Indexed by deck ID
- Supports multiple regions per card

#### Export Queue Store
- Queues exports to be synced when online
- Tracks status: pending, syncing, completed, failed
- Stores export data and any error messages

### 3. Cache Management UI

Access settings through the "Show Settings" button on the main page:

#### Cache Statistics
- View number of stored decks
- View OCR results and occlusion metadata counts
- Monitor pending exports
- Check total cache size in human-readable format

#### Data Export
- Export all local data as JSON
- Automatic timestamp in filename
- Data can be backed up or transferred to another device

#### Data Import
- Import previously exported JSON data
- Restores all decks, OCR results, and metadata
- Useful for migrations or data restoration

#### Clear Cache
- Remove all stored data when needed
- Includes confirmation dialog to prevent accidental deletion
- Useful for resetting the app

### 4. Background Sync

When the application is back online:

- Pending exports are automatically synced to the backend
- Export status is updated from 'pending' to 'syncing' to 'completed'
- Failed syncs are retried on next online event
- Users receive feedback on sync progress

### 5. Offline Indicator

A floating indicator in the bottom-right corner shows:

- **Green dot with "Back online"**: Connection restored (auto-hides after 3 seconds)
- **Red pulsing dot with "You are offline"**: No connection available
- Automatically appears/disappears based on network status

### 6. PWA Installation

The app meets all PWA installability criteria:

#### Installation Options
- **Chrome/Edge**: "Install app" button in the browser menu
- **Safari (iOS)**: Add to Home Screen from the share menu
- **Firefox**: "Install" option in the address bar
- **Mobile Chrome**: Install prompt appears automatically

#### Manifest
- Located at `/manifest.json`
- Defines app name, icons, colors, and display mode
- Includes app shortcuts and screenshots for PWA stores

#### Installation Features
- Standalone display mode (no browser UI)
- Custom splash screen with app name and colors
- App icons (192x192 and 512x512)
- Maskable icons for adaptive display

## Usage

### Using the App Offline

1. **First Visit (Online)**
   - Open the app in your browser
   - All assets are cached automatically
   - Service worker registers and takes control

2. **Subsequent Visits (Any Network State)**
   - The app loads from cache immediately
   - Updates are checked in the background
   - You can work offline with full functionality

3. **Working With Local Data**
   - Create and edit decks in IndexedDB
   - Perform OCR and save results locally
   - Define occlusions and save metadata

### Exporting Offline

1. Go to Settings
2. Click "Export Data"
3. A JSON file is downloaded with all your data
4. File is named: `anki-occlusion-backup-YYYY-MM-DD.json`

### Importing Data

1. Go to Settings
2. Click "Import Data"
3. Select a previously exported JSON file
4. Data is restored to IndexedDB

### Clearing Cache

1. Go to Settings
2. Click "Clear All Cache"
3. Confirm the action
4. All data is permanently deleted

## API Endpoints

The backend should provide the following endpoints for full sync functionality:

### POST /api/exports
Receives queued exports from the client.

**Request:**
```json
{
  "deckId": "string",
  "exportType": "cards|metadata|all",
  "data": {}
}
```

**Response:**
```json
{
  "success": true,
  "exportId": "string"
}
```

## Browser Support

- **Chrome/Edge**: Full support (v90+)
- **Firefox**: Full support (v88+)
- **Safari**: Full support (v15+, iOS 15+)
- **Mobile Chrome**: Full support

## Storage Limits

- IndexedDB: Typically 50MB+ per origin
- Service Worker Cache: Browser dependent (usually 100MB+)
- Total PWA Storage: Depends on user's device and browser

## Performance

### Load Time
- First load: Assets downloaded and cached
- Subsequent loads: Assets served from cache (< 100ms)

### Memory Usage
- Service Worker: ~5-10MB
- IndexedDB with sample data: 1-10MB
- Cache Storage: 5-20MB for typical app

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS is used in production (HTTP allowed for localhost)
- Clear browser cache and reload

### IndexedDB Not Working
- Check if private/incognito mode (IndexedDB disabled)
- Verify browser storage quota isn't exceeded
- Try clearing site data and reloading

### Cache Not Updating
- Service worker updates are checked on page reload
- Force refresh (Ctrl+Shift+R) to clear all caches
- Check devtools > Storage > Service Workers

## Testing

### E2E Tests with Playwright

Run offline mode tests:

```bash
cd frontend
pnpm install
pnpm test:e2e
```

#### Test Coverage
- Offline indicator visibility
- App functionality while offline
- Service worker registration
- Cache settings UI
- Network throttling (3G simulation)
- PWA installability criteria
- Export/import functionality

### Manual Testing

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Service Workers panel**: Verify service worker is registered
4. **Cache Storage**: Browse cached assets
5. **IndexedDB**: View stored data

### Network Throttling
1. **DevTools > Network tab**
2. Select throttling profile (e.g., "Slow 3G")
3. Reload the page to test with simulated slow network

### Offline Testing
1. **DevTools > Application tab**
2. Check the "Offline" checkbox
3. Page should continue functioning with cached assets

## Future Enhancements

- [ ] Periodic background sync for automatic cache updates
- [ ] Sync status notifications with granular control
- [ ] Compression for cached data
- [ ] Export as APKG format directly
- [ ] Collaborative offline editing with conflict resolution
- [ ] Selective sync for large decks
- [ ] Delta sync for partial updates

## References

- [MDN: Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Google: Workbox](https://developers.google.com/web/tools/workbox)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [MDN: Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
