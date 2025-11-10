import { useState, useEffect } from 'react'
import { useDeckStore } from '../../store/deckStore'
import { Deck, Card } from '../../types'
import { DeckList } from './DeckList'
import { DeckForm } from './DeckForm'
import { CardForm } from './CardForm'
import './deck.css'

type View = 'list' | 'create-deck' | 'edit-deck' | 'create-card' | 'edit-card'

export function DeckManager() {
  const { loadCards, getCardsByDeckId } = useDeckStore()
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  useEffect(() => {
    if (selectedDeck) {
      loadCards(selectedDeck.id)
    }
  }, [selectedDeck, loadCards])

  const handleCreateDeck = () => {
    setCurrentView('create-deck')
  }

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setCurrentView('edit-deck')
  }

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck)
  }

  const handleCreateCard = () => {
    if (!selectedDeck) return
    setCurrentView('create-card')
  }

  const handleEditCard = (card: Card) => {
    setSelectedCard(card)
    setCurrentView('edit-card')
  }

  const handleDeckFormSubmit = () => {
    setCurrentView('list')
    setSelectedDeck(null)
  }

  const handleCardFormSubmit = () => {
    setCurrentView('list')
    setSelectedCard(null)
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedDeck(null)
    setSelectedCard(null)
  }

  const cards = selectedDeck ? getCardsByDeckId(selectedDeck.id) : []

  return (
    <div className="deck-manager">
      {currentView === 'list' && (
        <>
          <div className="deck-manager-header">
            <button onClick={handleCreateDeck} className="create-deck-button">
              + Create Deck
            </button>
          </div>
          <DeckList
            onSelectDeck={handleSelectDeck}
            onEditDeck={handleEditDeck}
            onDeleteDeck={() => setSelectedDeck(null)}
          />
          {selectedDeck && (
            <div className="deck-cards">
              <div className="deck-cards-header">
                <h3>Cards in {selectedDeck.name}</h3>
                <button onClick={handleCreateCard} className="create-card-button">
                  + Add Card
                </button>
              </div>
              {cards.length === 0 ? (
                <div className="empty-state">
                  <p>No cards in this deck. Add your first card!</p>
                </div>
              ) : (
                <div className="cards-list">
                  {cards.map((card) => (
                    <div key={card.id} className="card-item">
                      <div className="card-content">
                        <div className="card-front">
                          <strong>Front:</strong> {card.front}
                        </div>
                        <div className="card-back">
                          <strong>Back:</strong> {card.back}
                        </div>
                        {card.notes && (
                          <div className="card-notes">
                            <strong>Notes:</strong> {card.notes}
                          </div>
                        )}
                        {card.occlusions.length > 0 && (
                          <div className="card-occlusions">
                            <strong>Occlusions:</strong> {card.occlusions.length}
                          </div>
                        )}
                        {card.tags.length > 0 && (
                          <div className="card-tags">
                            {card.tags.map((tag) => (
                              <span key={tag} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditCard(card)}
                        className="edit-card-button"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {currentView === 'create-deck' && (
        <DeckForm onSubmit={handleDeckFormSubmit} onCancel={handleCancel} />
      )}

      {currentView === 'edit-deck' && selectedDeck && (
        <DeckForm deck={selectedDeck} onSubmit={handleDeckFormSubmit} onCancel={handleCancel} />
      )}

      {currentView === 'create-card' && selectedDeck && (
        <CardForm deckId={selectedDeck.id} onSubmit={handleCardFormSubmit} onCancel={handleCancel} />
      )}

      {currentView === 'edit-card' && selectedCard && (
        <CardForm
          card={selectedCard}
          deckId={selectedCard.deckId}
          onSubmit={handleCardFormSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
