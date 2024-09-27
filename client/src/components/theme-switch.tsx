import { IconMoon, IconSun, IconTree } from '@tabler/icons-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Theme } from '@/lib/theme-config'

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const themeColor =
      theme === 'dark' ? '#020817' : theme === 'forest' ? '#f0f9f0' : '#ffffff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    metaThemeColor && metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full'>
          {theme === 'light' && <IconSun size={20} />}
          {theme === 'dark' && <IconMoon size={20} />}
          {theme === 'forest' && <IconTree size={20} />}
          {theme === 'system' && <IconSun size={20} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <IconSun className='mr-2 h-4 w-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <IconMoon className='mr-2 h-4 w-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('forest')}>
          <IconTree className='mr-2 h-4 w-4' />
          <span>Forest</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <IconSun className='mr-2 h-4 w-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
