import { useState, FC } from 'react'
import OcclusionEditor from './components/OcclusionEditor'
import { OcclusionData } from './types/occlusion'
import './App.css'

const App: FC = () => {
  const [savedData, setSavedData] = useState<OcclusionData | null>(null)

  const handleSave = (data: OcclusionData) => {
    setSavedData(data)
    console.log('Saved occlusion data:', data)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          Anki Image Occlusion Generator
        </h1>
      </header>

      <main style={{ flex: 1, overflow: 'hidden' }}>
        <OcclusionEditor
          imagePath="https://via.placeholder.com/800x600?text=Upload+an+Image"
          imageWidth={800}
          imageHeight={600}
          onSave={handleSave}
        />
      </main>

      {savedData && (
        <footer style={{ padding: '12px 24px', borderTop: '1px solid #eee', fontSize: '12px', color: '#666' }}>
          ✓ Last saved: {new Date(savedData.updatedAt).toLocaleTimeString()}
        </footer>
      )}
    </div>
  )
}

export default App
