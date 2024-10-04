import { Input } from '@/components/ui/input'
import { useFolder } from '@/contexts/FolderContext'
import { useLocation } from 'react-router-dom'

export function Search() {
  const { folderName } = useFolder()
  const location = useLocation()
  const currentPage = location.pathname.split('/').pop()

  // Regular expression to check for a valid email
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(folderName as string)

  const isWord = /^[a-zA-Z]+$/.test(currentPage as string)

  console.log(' ====== Search ========= ')
  console.log('Is Word:', isWord)
  console.log('Folder Name:', folderName)
  console.log('Is Email:', isEmail)
  console.log(' ====== Search ========= ')

  return (
    <div>
      <div
        className='text-lg font-medium capitalize'
        style={{ textTransform: 'capitalize' }}
      >
        {isWord
          ? currentPage + ' Page'
          : isEmail
            ? 'Dashboard'
            : folderName + ' Folder'}
      </div>
      <Input
        type='search'
        placeholder='Search...'
        className='hidden md:w-[100px] lg:w-[300px]'
      />
    </div>
  )
}
