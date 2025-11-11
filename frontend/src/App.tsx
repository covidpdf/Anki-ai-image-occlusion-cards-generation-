import type { FC, ReactNode } from 'react'
import Upload from './features/upload'
import Occlusion from './features/occlusion'
import Cards from './features/cards'
import ExportDecks from './features/export'

type Step = {
  label: string
  render: () => ReactNode
}

const steps: Step[] = [
  {
    label: 'Upload & OCR',
    render: () => <Upload />,
  },
  {
    label: 'Occlusion Editor',
    render: () => <Occlusion />,
  },
  {
    label: 'Card Builder',
    render: () => <Cards />,
  },
  {
    label: 'Export Decks',
    render: () => <ExportDecks />,
  },
]

const App: FC = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anki Decks Pro</p>
            <h1 className="text-2xl font-semibold text-slate-900">Bootstrap overview</h1>
            <p className="mt-1 text-sm text-slate-600">A guided preview of the MVP workflow.</p>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            MVP scaffold
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <nav aria-label="Workflow" className="mb-10">
          <ol className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {steps.map((step, index) => (
              <li key={step.label} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-700">{step.label}</span>
                {index < steps.length - 1 && (
                  <span className="hidden flex-1 border-t border-dashed border-slate-300 sm:block" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <div key={step.label}>{step.render()}</div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
