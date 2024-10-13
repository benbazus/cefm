import * as React from 'react'
import {
  FileIcon,
  FolderIcon,
  LayoutListIcon,
  LayoutGridIcon,
  CheckCircle2Icon,
} from 'lucide-react'
import { Button } from './custom/button'
import { cn } from '@/lib/utils'
import { useView, ViewState } from '@/contexts/UserContext'
import { useLocation } from 'react-router-dom'

type ContentType = 'files' | 'folders'
type ViewType = 'list' | 'grid'

const DriveTopMenu: React.FC = () => {
  const { selectedView, setSelectedView } = useView()
  const location = useLocation()

  const currentPage = location.pathname.split('/').pop()

  const isExcludedPage = [
    // '/drive/trash',
    '/drive/excel',
    '/drive/photo',
    '/drive/audio',
    '/drive/video',
    '/drive/word',
    '/drive/document',
    '/drive/documents',
    '/drive/pdf',
  ].includes(location.pathname)

  const handleButtonClick = (
    type: 'contentType' | 'viewType',
    value: ContentType | ViewType
  ) => {
    setSelectedView((prev: ViewState) => ({ ...prev, [type]: value }))
  }

  const ButtonComponent: React.FC<{
    type: 'contentType' | 'viewType'
    value: ContentType | ViewType
    icon: React.ElementType
    label: string
  }> = ({ type, value, icon: Icon, label }) => (
    <Button
      variant='outline'
      className={cn(
        'rounded-full',
        selectedView[type] === value && 'bg-secondary'
      )}
      onClick={() => handleButtonClick(type, value)}
    >
      <Icon className='mr-2 h-4 w-4' />
      {label}
      {selectedView[type] === value && (
        <CheckCircle2Icon className='ml-2 h-4 w-4' />
      )}
    </Button>
  )

  return (
    <nav className='p-2'>
      <div className='flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0'>
        <div className='flex items-center space-x-2'>
          <div
            className='hidden text-lg font-medium capitalize'
            style={{ textTransform: 'capitalize' }}
          >
            {currentPage}
          </div>
          {!isExcludedPage && (
            <div className='flex space-x-2'>
              <ButtonComponent
                type='contentType'
                value='files'
                icon={FileIcon}
                label='Files'
              />
              <ButtonComponent
                type='contentType'
                value='folders'
                icon={FolderIcon}
                label='Folders'
              />
            </div>
          )}
        </div>
        <div className='flex space-x-2'>
          <ButtonComponent
            type='viewType'
            value='list'
            icon={LayoutListIcon}
            label='List'
          />
          <ButtonComponent
            type='viewType'
            value='grid'
            icon={LayoutGridIcon}
            label='Grid'
          />
        </div>
      </div>
    </nav>
  )
}

export default DriveTopMenu
