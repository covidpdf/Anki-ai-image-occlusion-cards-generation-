import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HomePage } from '@/pages/home'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  it('renders main heading', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText('AI-Powered Image Occlusion')).toBeInTheDocument()
    expect(screen.getByText('Flashcard Generation')).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Browse Decks')).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText('AI-Powered')).toBeInTheDocument()
    expect(screen.getByText('Easy Upload')).toBeInTheDocument()
    expect(screen.getByText('Spaced Repetition')).toBeInTheDocument()
    expect(screen.getByText('Progress Tracking')).toBeInTheDocument()
    expect(screen.getByText('Share & Collaborate')).toBeInTheDocument()
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
  })

  it('renders statistics section', () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByText('Join Thousands of Learners')).toBeInTheDocument()
    expect(screen.getByText('50K+')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('1M+')).toBeInTheDocument()
    expect(screen.getByText('Cards Created')).toBeInTheDocument()
  })

  it('applies responsive design classes', () => {
    const { container } = renderWithRouter(<HomePage />)

    // Check for responsive grid classes
    const featuresGrid = container.querySelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3')
    expect(featuresGrid).toBeInTheDocument()

    const statsGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-4')
    expect(statsGrid).toBeInTheDocument()
  })

  it('renders hero section with proper styling', () => {
    const { container } = renderWithRouter(<HomePage />)

    const heroSection = container.querySelector('.text-center.space-y-6.py-12')
    expect(heroSection).toBeInTheDocument()

    const mainHeading = container.querySelector('.text-4xl.font-bold.tracking-tight.sm\\:text-6xl')
    expect(mainHeading).toBeInTheDocument()
  })
})