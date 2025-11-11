import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders all four MVP pillars', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Upload & OCR' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Occlusion Editor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Card Builder' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Export Decks' })).toBeInTheDocument()
  })

  it('displays the header with correct title', () => {
    render(<App />)

    expect(screen.getByText('Anki Decks Pro')).toBeInTheDocument()
    expect(screen.getByText('Bootstrap overview')).toBeInTheDocument()
  })

  it('displays workflow navigation with step numbers', () => {
    render(<App />)

    const steps = screen.getAllByRole('listitem')
    expect(steps).toHaveLength(4)

    steps.forEach((step, index) => {
      expect(within(step).getByText(String(index + 1))).toBeInTheDocument()
    })
  })

  it('matches snapshot', () => {
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
  })
})
