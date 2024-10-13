import { Input } from '@/components/ui/input'
import { useFolder } from '@/contexts/FolderContext'
import { useLocation } from 'react-router-dom'

export function Search() {
  const { folderName } = useFolder()
  const location = useLocation()
  const currentPage = location.pathname.split('/').pop()

  // Regular expression to check for a valid email
  const isEmail = folderName && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(folderName)

  const isWord = /^[a-zA-Z]+$/.test(currentPage as string)

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
            : folderName
              ? folderName + ' Folder'
              : 'Dashboard'}
      </div>
      <Input
        type='search'
        placeholder='Search...'
        className='hidden md:w-[100px] lg:w-[300px]'
      />
    </div>
  )
}
