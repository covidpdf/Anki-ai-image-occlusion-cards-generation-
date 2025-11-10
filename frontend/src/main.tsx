import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerManager';

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  registerServiceWorker().catch((error) => {
    console.warn('Failed to register service worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
