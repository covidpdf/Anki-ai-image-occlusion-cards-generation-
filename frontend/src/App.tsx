import { useState } from 'react'
import './App.css'
import { DeckExporter } from './components/DeckExporter'

function App() {
  const [currentView, setCurrentView] = useState<'export' | 'about'>('export')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Anki Image Occlusion Generator</h1>
        <nav className="app-nav">
          <button
            onClick={() => setCurrentView('export')}
            className={currentView === 'export' ? 'active' : ''}
          >
            Export Deck
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={currentView === 'about' ? 'active' : ''}
          >
            About
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'export' && <DeckExporter />}
        {currentView === 'about' && (
          <div className="about-section">
            <h2>About Anki Image Occlusion Generator</h2>
            <p>
              This application allows you to create Anki flashcards with image occlusions.
              Upload images, add occlusion masks to hide parts of the image, and export
              everything as an .apkg file that can be imported into Anki.
            </p>
            <h3>Features</h3>
            <ul>
              <li>Upload images in various formats (JPEG, PNG, GIF, WebP)</li>
              <li>Create interactive occlusion masks by clicking and dragging on images</li>
              <li>Add custom questions, answers, and tags to cards</li>
              <li>Export decks as Anki-compatible .apkg files</li>
              <li>Validate decks before export</li>
            </ul>
            <h3>How to Use</h3>
            <ol>
              <li>Set your deck name and description</li>
              <li>Click "Add Card" to create a new card</li>
              <li>Upload an image for the card</li>
              <li>Click "Add Occlusion" and then drag on the image to create occlusion masks</li>
              <li>Add question text, answer text, and tags</li>
              <li>Add more cards if needed</li>
              <li>Click "Export to .apkg" to download your deck</li>
              <li>Import the .apkg file into Anki</li>
            </ol>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Anki Image Occlusion Generator - Create interactive flashcards for better learning</p>
      </footer>
    </div>
  )
}

export default App
