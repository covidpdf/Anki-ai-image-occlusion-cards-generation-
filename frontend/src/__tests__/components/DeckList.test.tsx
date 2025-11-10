import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'fake-indexeddb/auto'
import { DeckList } from '../../components/deck/DeckList'
import { useDeckStore } from '../../store/deckStore'
import { useSyncStore } from '../../store/syncStore'
import { db } from '../../db/database'

vi.mock('../../store/syncStore')

describe('DeckList', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
    useDeckStore.setState({
      decks: [],
      cards: [],
      selectedDeckId: null,
      searchQuery: '',
      tagFilter: [],
    })

    vi.mocked(useSyncStore).mockReturnValue({
      startSync: vi.fn().mockResolvedValue({ success: true, synced: 0, conflicts: [], errors: [] }),
      isSyncing: false,
      lastSyncAt: undefined,
      syncErrors: [],
      conflicts: [],
      resolveConflict: vi.fn(),
      clearErrors: vi.fn(),
      clearConflicts: vi.fn(),
      addError: vi.fn(),
      addConflict: vi.fn(),
      removeConflict: vi.fn(),
    })
  })

  afterEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
  })

  it('should render empty state when no decks', async () => {
    render(<DeckList />)

    await waitFor(() => {
      expect(screen.getByText(/no decks found/i)).toBeInTheDocument()
    })
  })

  it('should render list of decks', async () => {
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Math Deck', description: 'Mathematics' })
    await store.createDeck({ name: 'Science Deck', description: 'Science' })
    await store.loadDecks()

    render(<DeckList />)

    await waitFor(() => {
      expect(screen.getByText('Math Deck')).toBeInTheDocument()
      expect(screen.getByText('Science Deck')).toBeInTheDocument()
    })
  })

  it('should filter decks by search query', async () => {
    const user = userEvent.setup()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Math Deck' })
    await store.createDeck({ name: 'Science Deck' })
    await store.loadDecks()

    render(<DeckList />)

    const searchInput = screen.getByPlaceholderText(/search decks/i)
    await user.type(searchInput, 'math')

    await waitFor(() => {
      expect(screen.getByText('Math Deck')).toBeInTheDocument()
      expect(screen.queryByText('Science Deck')).not.toBeInTheDocument()
    })
  })

  it('should filter decks by tags', async () => {
    const user = userEvent.setup()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Math Deck', tags: ['math', 'algebra'] })
    await store.createDeck({ name: 'Science Deck', tags: ['science'] })
    await store.loadDecks()

    render(<DeckList />)

    await waitFor(() => {
      expect(screen.getByText('Math Deck')).toBeInTheDocument()
    })

    const mathTagButtons = screen.getAllByText('math')
    const mathFilterButton = mathTagButtons.find((el) => el.classList.contains('tag-filter'))
    expect(mathFilterButton).toBeDefined()
    await user.click(mathFilterButton!)

    await waitFor(() => {
      expect(screen.getByText('Math Deck')).toBeInTheDocument()
      expect(screen.queryByText('Science Deck')).not.toBeInTheDocument()
    })
  })

  it('should clear tag filters', async () => {
    const user = userEvent.setup()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Math Deck', tags: ['math'] })
    await store.createDeck({ name: 'Science Deck', tags: ['science'] })
    await store.loadDecks()

    render(<DeckList />)

    const mathTagButtons = screen.getAllByText('math')
    const mathFilterButton = mathTagButtons.find((el) => el.classList.contains('tag-filter'))
    expect(mathFilterButton).toBeDefined()
    await user.click(mathFilterButton!)

    await waitFor(() => {
      expect(screen.queryByText('Science Deck')).not.toBeInTheDocument()
    })

    const clearButton = screen.getByText(/clear/i)
    await user.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText('Math Deck')).toBeInTheDocument()
      expect(screen.getByText('Science Deck')).toBeInTheDocument()
    })
  })

  it('should call onSelectDeck when deck is clicked', async () => {
    const user = userEvent.setup()
    const onSelectDeck = vi.fn()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Test Deck' })
    await store.loadDecks()

    render(<DeckList onSelectDeck={onSelectDeck} />)

    const deckElement = screen.getByText('Test Deck')
    await user.click(deckElement)

    expect(onSelectDeck).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Deck' })
    )
  })

  it('should call onEditDeck when edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEditDeck = vi.fn()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Test Deck' })
    await store.loadDecks()

    render(<DeckList onEditDeck={onEditDeck} />)

    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)

    expect(onEditDeck).toHaveBeenCalled()
  })

  it('should delete deck with confirmation', async () => {
    const user = userEvent.setup()
    const onDeleteDeck = vi.fn()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Test Deck' })
    await store.loadDecks()

    window.confirm = vi.fn(() => true)

    render(<DeckList onDeleteDeck={onDeleteDeck} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(onDeleteDeck).toHaveBeenCalled()
      expect(screen.queryByText('Test Deck')).not.toBeInTheDocument()
    })
  })

  it('should not delete deck if confirmation is cancelled', async () => {
    const user = userEvent.setup()
    const onDeleteDeck = vi.fn()
    const store = useDeckStore.getState()
    await store.createDeck({ name: 'Test Deck' })
    await store.loadDecks()

    window.confirm = vi.fn(() => false)

    render(<DeckList onDeleteDeck={onDeleteDeck} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(onDeleteDeck).not.toHaveBeenCalled()
      expect(screen.getByText('Test Deck')).toBeInTheDocument()
    })
  })

  it('should display sync button', async () => {
    render(<DeckList />)

    expect(screen.getByRole('button', { name: /sync/i })).toBeInTheDocument()
  })

  it('should call sync when sync button is clicked', async () => {
    const user = userEvent.setup()
    const mockStartSync = vi.fn().mockResolvedValue({ success: true, synced: 0, conflicts: [], errors: [] })
    
    vi.mocked(useSyncStore).mockReturnValue({
      startSync: mockStartSync,
      isSyncing: false,
      lastSyncAt: undefined,
      syncErrors: [],
      conflicts: [],
      resolveConflict: vi.fn(),
      clearErrors: vi.fn(),
      clearConflicts: vi.fn(),
      addError: vi.fn(),
      addConflict: vi.fn(),
      removeConflict: vi.fn(),
    })

    render(<DeckList />)

    const syncButton = screen.getByRole('button', { name: /sync/i })
    await user.click(syncButton)

    expect(mockStartSync).toHaveBeenCalled()
  })

  it('should display deck metadata', async () => {
    const store = useDeckStore.getState()
    const deck = await store.createDeck({
      name: 'Test Deck',
      description: 'Test description',
      tags: ['test', 'example'],
    })
    await store.createCard({ deckId: deck.id, front: 'Q1', back: 'A1' })
    await store.createCard({ deckId: deck.id, front: 'Q2', back: 'A2' })
    await store.loadDecks()

    render(<DeckList />)

    expect(await screen.findByText('Test description')).toBeInTheDocument()
    expect(await screen.findByText(/2.*cards/i)).toBeInTheDocument()
    
    const testTags = screen.getAllByText('test')
    expect(testTags.length).toBeGreaterThan(0)
    
    const exampleTags = screen.getAllByText('example')
    expect(exampleTags.length).toBeGreaterThan(0)
  })
})
