import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Layout } from '@/components/layout'

// Mock the components
vi.mock('@/components/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Layout', () => {
  it('renders header and main content area', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    const layoutDiv = container.firstChild as HTMLElement
    expect(layoutDiv).toHaveClass('min-h-screen', 'bg-background', 'font-sans', 'antialiased')
  })

  it('renders main container with correct styling', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('container', 'mx-auto', 'px-4', 'py-6')
  })
})