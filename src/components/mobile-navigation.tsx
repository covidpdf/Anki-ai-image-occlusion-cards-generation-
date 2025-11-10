import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Upload, BookOpen, Brain, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/decks', label: 'Decks', icon: BookOpen },
  { path: '/study', label: 'Study', icon: Brain },
]

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="h-9 w-9"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg z-50">
          <nav className="container mx-auto px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 w-full px-3 py-3 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}