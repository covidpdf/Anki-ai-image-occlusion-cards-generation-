import { FC, useMemo, useState } from 'react'
import { UploadPage } from './features/upload'
import { OcclusionPage } from './features/occlusion'
import { CardsPage } from './features/cards'
import { ExportPage } from './features/export'

type StepKey = 'upload' | 'occlusion' | 'cards' | 'export'

type StepConfig = {
  key: StepKey
  title: string
  summary: string
  component: FC
}

const steps: StepConfig[] = [
  {
    key: 'upload',
    title: 'Upload & OCR',
    summary: 'Import images and extract text',
    component: UploadPage,
  },
  {
    key: 'occlusion',
    title: 'Occlusion',
    summary: 'Design masks and card states',
    component: OcclusionPage,
  },
  {
    key: 'cards',
    title: 'Cards',
    summary: 'Review generated flashcards',
    component: CardsPage,
  },
  {
    key: 'export',
    title: 'Export',
    summary: 'Finalize and export your deck',
    component: ExportPage,
  },
]

const App: FC = () => {
  const [activeStep, setActiveStep] = useState<StepKey>('upload')

  const ActiveComponent = useMemo(() => {
    const current = steps.find((step) => step.key === activeStep)
    return current?.component ?? UploadPage
  }, [activeStep])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800/60 bg-slate-950/60 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r">
          <div className="px-6 pb-6 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Workflow
            </p>
            <h1 className="mt-4 text-2xl font-semibold text-white">Anki Image Occlusion</h1>
            <p className="mt-2 text-sm text-slate-400">
              A guided setup for transforming medical imagery into study-ready decks.
            </p>
          </div>
          <nav className="space-y-1 px-4 pb-6">
            {steps.map((step, index) => {
              const isActive = activeStep === step.key

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveStep(step.key)}
                  className={[
                    'group flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left transition',
                    isActive
                      ? 'bg-slate-800/70 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/40 hover:text-white',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-9 w-9 flex-none items-center justify-center rounded-full border text-sm font-semibold transition',
                      isActive
                        ? 'border-white/80 bg-white/10 text-white'
                        : 'border-slate-600 bg-slate-900 text-slate-300 group-hover:border-slate-400 group-hover:text-white',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{step.title}</span>
                    <span className="text-xs text-slate-400">{step.summary}</span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 lg:p-10">
          <div className="flex h-full flex-col rounded-3xl border border-slate-800/80 bg-white/95 text-slate-900 shadow-lg">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
