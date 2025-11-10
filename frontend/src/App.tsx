import './App.css'
import { DeckManager } from './components/deck'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Anki Image Occlusion Generator</h1>
        <p>Manage your flashcard decks with offline support</p>
      </header>
      <main className="app-main">
        <DeckManager />
      </main>
    </div>
  )
}

export default App
