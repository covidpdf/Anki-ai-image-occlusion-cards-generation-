import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeToggle } from '@/components/theme-toggle'

// Mock the theme store with a default implementation
const mockToggleTheme = vi.fn()
vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear DOM class modifications between tests
    document.documentElement.classList.remove('light', 'dark')
    vi.clearAllMocks()
  })

  it('renders theme toggle switch', () => {
    render(<ThemeToggle />)

    // Check for sun and moon icons
    const sunIcon = document.querySelector('svg.lucide-sun')
    const moonIcon = document.querySelector('svg.lucide-moon')
    const switchElement = screen.getByRole('switch')

    expect(sunIcon).toBeInTheDocument()
    expect(moonIcon).toBeInTheDocument()
    expect(switchElement).toBeInTheDocument()
  })

  it('toggles theme when switch is clicked', async () => {
    const user = userEvent.setup()
    
    render(<ThemeToggle />)

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows correct initial state based on theme', () => {
    // This test would require more complex mocking for different themes
    // For now, we'll just test the default light theme state
    render(<ThemeToggle />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()
  })
})