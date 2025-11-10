import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MobileNavigation } from '@/components/mobile-navigation'

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  )
}

describe('MobileNavigation', () => {
  it('renders menu button when closed', () => {
    renderWithRouter(<MobileNavigation />)
    
    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()
    
    // Should show Menu icon when closed
    expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument()
  })

  it('opens menu when menu button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MobileNavigation />)
    
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Should show navigation items
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Decks')).toBeInTheDocument()
    expect(screen.getByText('Study')).toBeInTheDocument()
  })

  it('closes menu when X button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MobileNavigation />)
    
    // Open menu first
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    expect(screen.getByText('Upload')).toBeInTheDocument()
    
    // Click the same button (now X) to close
    await user.click(menuButton)
    
    // Navigation items should no longer be visible
    expect(screen.queryByText('Upload')).not.toBeInTheDocument()
  })

  it('highlights active navigation item', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MobileNavigation />, ['/decks'])
    
    const menuButton = screen.getByRole('button')
    
    // Open menu
    await user.click(menuButton)
    
    const decksLink = screen.getByText('Decks').closest('a')
    expect(decksLink).toHaveClass('bg-accent', 'text-accent-foreground')
  })

  it('closes menu when navigation item is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MobileNavigation />)
    
    // Open menu
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Click on a navigation item
    const uploadLink = screen.getByText('Upload')
    await user.click(uploadLink)
    
    // Menu should close
    expect(screen.queryByText('Upload')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    renderWithRouter(<MobileNavigation />)
    
    const container = document.querySelector('.md\\:hidden')
    expect(container).toBeInTheDocument()
    
    const menuButton = screen.getByRole('button')
    expect(menuButton).toHaveClass('h-9', 'w-9')
  })

  it('shows icons for navigation items', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MobileNavigation />)
    
    // Open menu
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check that icons are rendered
    const icons = document.querySelectorAll('svg.lucide-upload, svg.lucide-book-open, svg.lucide-brain')
    expect(icons).toHaveLength(3)
  })
})