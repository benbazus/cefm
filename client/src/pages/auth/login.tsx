import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, ChevronDown, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoginForm } from './components/login-form'

const LoginPage = () => {
  const DropFileLogo = () => (
    <svg
      width='48'
      height='24'
      viewBox='0 0 12 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
    >
      <path d='M12 2L2 7L12 12L22 7L12 2Z' />
      <path d='M12 12L12 22' />
      <path d='M12 12L2 17L12 22L22 17L12 12Z' />
    </svg>
  )

  return (
    <div className='flex min-h-screen flex-col bg-gray-100'>
      <header className='flex items-center justify-between bg-white p-2'>
        <Link to='/' target='_blank' rel='noopener noreferrer nofollow'>
          <DropFileLogo />
        </Link>

        <div className='hidden'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='flex items-center'>
                <Globe className='mr-2 h-4 w-4' />
                <span>English</span>
                <ChevronDown className='ml-1 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>English</DropdownMenuItem>
              {/* Add more language options here */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <LoginForm />

      <footer className='bg-white p-4 text-center'>
        <p>DropFile . Privacy by default.</p>
        <div className='mt-4'>
          <Link
            to='/legal/terms'
            target='_blank'
            rel='noopener noreferrer nofollow'
            className='mx-2 text-blue-600 hover:underline'
          >
            Terms
          </Link>
          <span className='mx-2 text-gray-300'>|</span>
          <Link
            to='/legal/privacy'
            target='_blank'
            rel='noopener noreferrer nofollow'
            className='mx-2 text-blue-600 hover:underline'
          >
            Privacy policy
          </Link>
          <span className='mx-2 text-gray-300'>|</span>
          <span>Version 0.0.1</span>
        </div>
      </footer>
    </div>
  )
}

export default LoginPage
