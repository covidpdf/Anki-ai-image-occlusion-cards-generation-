import { useThemeStore } from '@/stores/theme'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
      />
      <Moon className="h-4 w-4" />
    </div>
  )
}