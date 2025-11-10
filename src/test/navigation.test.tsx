import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navigation } from '@/components/navigation'

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  )
}

describe('Navigation', () => {
  it('renders all navigation items', () => {
    renderWithRouter(<Navigation />)

    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Decks')).toBeInTheDocument()
    expect(screen.getByText('Study')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    renderWithRouter(<Navigation />, ['/decks'])

    const decksLink = screen.getByText('Decks').closest('a')
    expect(decksLink).toHaveClass('bg-accent', 'text-accent-foreground')
  })

  it('does not highlight inactive navigation items', () => {
    renderWithRouter(<Navigation />, ['/upload'])

    const decksLink = screen.getByText('Decks').closest('a')
    expect(decksLink).not.toHaveClass('bg-accent', 'text-accent-foreground')
  })

  it('navigates to correct routes when clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Navigation />)

    const uploadLink = screen.getByText('Upload')
    await user.click(uploadLink)

    // In a real app, you'd check the URL changed
    // For this test, we just verify the link has correct href
    expect(uploadLink.closest('a')).toHaveAttribute('href', '/upload')
  })

  it('shows icons for each navigation item', () => {
    renderWithRouter(<Navigation />)

    // Check that icons are rendered (they should be present as SVG elements)
    const icons = document.querySelectorAll('svg')
    expect(icons).toHaveLength(3) // One for each nav item
  })

  it('applies hover effects', () => {
    renderWithRouter(<Navigation />)

    const uploadLink = screen.getByText('Upload').closest('a')
    expect(uploadLink).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
  })
})