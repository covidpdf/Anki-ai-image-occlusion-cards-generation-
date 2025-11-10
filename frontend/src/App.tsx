import { useState } from 'react';
import './App.css';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CacheSettings } from './components/CacheSettings';
import { DeckExample } from './components/DeckExample';

function App() {
  const [count, setCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <OfflineIndicator />
      <div>
        <h1>Anki Image Occlusion Generator</h1>
        <p>Welcome to the application</p>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      </div>
      <DeckExample />
      <div className="settings-section">
        <button onClick={() => setShowSettings(!showSettings)} className="settings-toggle">
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
        {showSettings && <CacheSettings />}
      </div>
    </>
  );
}

export default App;
