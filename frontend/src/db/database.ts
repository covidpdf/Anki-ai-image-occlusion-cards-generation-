import Dexie, { Table } from 'dexie'
import { Card, Deck } from '../types'

export class AppDatabase extends Dexie {
  decks!: Table<Deck, string>
  cards!: Table<Card, string>

  constructor() {
    super('AnkiImageOcclusionDB')

    this.version(1).stores({
      decks: 'id, name, *tags, createdAt, updatedAt, syncStatus',
      cards: 'id, deckId, *tags, createdAt, updatedAt, syncStatus',
    })
  }
}

export const db = new AppDatabase()
