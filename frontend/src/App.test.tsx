import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App Layout', () => {
  it('should render all four workflow pillars', () => {
    const { container, getAllByText } = render(<App />)

    expect(getAllByText('Upload & OCR').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Import images and extract text').length).toBeGreaterThanOrEqual(1)

    expect(getAllByText('Occlusion').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Design masks and card states').length).toBeGreaterThanOrEqual(1)

    expect(getAllByText('Cards').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Review generated flashcards').length).toBeGreaterThanOrEqual(1)

    expect(getAllByText('Export').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Finalize and export your deck').length).toBeGreaterThanOrEqual(1)

    expect(container.querySelector('nav')).toBeInTheDocument()
    expect(container.querySelector('main')).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    const { container } = render(<App />)

    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="min-h-screen bg-slate-900 text-slate-100"
      >
        <div
          class="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row"
        >
          <aside
            class="w-full border-b border-slate-800/60 bg-slate-950/60 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r"
          >
            <div
              class="px-6 pb-6 pt-10"
            >
              <p
                class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
              >
                Workflow
              </p>
              <h1
                class="mt-4 text-2xl font-semibold text-white"
              >
                Anki Image Occlusion
              </h1>
              <p
                class="mt-2 text-sm text-slate-400"
              >
                A guided setup for transforming medical imagery into study-ready decks.
              </p>
            </div>
            <nav
              class="space-y-1 px-4 pb-6"
            >
              <button
                class="group flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left transition bg-slate-800/70 text-white shadow-sm"
                type="button"
              >
                <span
                  class="flex h-9 w-9 flex-none items-center justify-center rounded-full border text-sm font-semibold transition border-white/80 bg-white/10 text-white"
                >
                  1
                </span>
                <span
                  class="flex flex-col"
                >
                  <span
                    class="text-sm font-semibold"
                  >
                    Upload & OCR
                  </span>
                  <span
                    class="text-xs text-slate-400"
                  >
                    Import images and extract text
                  </span>
                </span>
              </button>
              <button
                class="group flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left transition text-slate-300 hover:bg-slate-800/40 hover:text-white"
                type="button"
              >
                <span
                  class="flex h-9 w-9 flex-none items-center justify-center rounded-full border text-sm font-semibold transition border-slate-600 bg-slate-900 text-slate-300 group-hover:border-slate-400 group-hover:text-white"
                >
                  2
                </span>
                <span
                  class="flex flex-col"
                >
                  <span
                    class="text-sm font-semibold"
                  >
                    Occlusion
                  </span>
                  <span
                    class="text-xs text-slate-400"
                  >
                    Design masks and card states
                  </span>
                </span>
              </button>
              <button
                class="group flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left transition text-slate-300 hover:bg-slate-800/40 hover:text-white"
                type="button"
              >
                <span
                  class="flex h-9 w-9 flex-none items-center justify-center rounded-full border text-sm font-semibold transition border-slate-600 bg-slate-900 text-slate-300 group-hover:border-slate-400 group-hover:text-white"
                >
                  3
                </span>
                <span
                  class="flex flex-col"
                >
                  <span
                    class="text-sm font-semibold"
                  >
                    Cards
                  </span>
                  <span
                    class="text-xs text-slate-400"
                  >
                    Review generated flashcards
                  </span>
                </span>
              </button>
              <button
                class="group flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left transition text-slate-300 hover:bg-slate-800/40 hover:text-white"
                type="button"
              >
                <span
                  class="flex h-9 w-9 flex-none items-center justify-center rounded-full border text-sm font-semibold transition border-slate-600 bg-slate-900 text-slate-300 group-hover:border-slate-400 group-hover:text-white"
                >
                  4
                </span>
                <span
                  class="flex flex-col"
                >
                  <span
                    class="text-sm font-semibold"
                  >
                    Export
                  </span>
                  <span
                    class="text-xs text-slate-400"
                  >
                    Finalize and export your deck
                  </span>
                </span>
              </button>
            </nav>
          </aside>
          <main
            class="flex-1 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 lg:p-10"
          >
            <div
              class="flex h-full flex-col rounded-3xl border border-slate-800/80 bg-white/95 text-slate-900 shadow-lg"
            >
              <div
                class="flex h-full flex-col items-center justify-center p-8"
              >
                <div
                  class="w-full max-w-2xl space-y-4 text-center"
                >
                  <h2
                    class="text-2xl font-semibold text-slate-900"
                  >
                    Upload & OCR
                  </h2>
                  <p
                    class="text-slate-600"
                  >
                    Upload images and extract text using OCR technology.
                  </p>
                  <div
                    class="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12"
                  >
                    <p
                      class="text-slate-400"
                    >
                      Placeholder for upload functionality
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `)
  })
})
