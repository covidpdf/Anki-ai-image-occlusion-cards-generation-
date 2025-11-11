import { FC } from 'react'

const CardsPage: FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Flashcard Generation</h2>
        <p className="text-slate-600">
          Generate Anki flashcards from your occluded images.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12">
          <p className="text-slate-400">Placeholder for card generation</p>
        </div>
      </div>
    </div>
  )
}

export default CardsPage
