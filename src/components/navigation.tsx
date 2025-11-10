import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Upload, BookOpen, Brain } from 'lucide-react'

const navItems = [
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/decks', label: 'Decks', icon: BookOpen },
  { path: '/study', label: 'Study', icon: Brain },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}