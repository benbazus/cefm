import { FileItem } from '@/types/types'
import { Loader2 } from 'lucide-react'
import { useView } from '@/contexts/UserContext'
import ItemListContainer from './drive-item'

interface DriveContainerProps {
  fileItems: FileItem[]
  isLoading: boolean
}

const DriveContainer = ({ fileItems, isLoading }: DriveContainerProps) => {
  const { selectedView } = useView()

  return (
    <>
      {isLoading ? (
        <div className='mt-24 flex w-full flex-col items-center gap-8'>
          <Loader2 className='h-32 w-32 animate-spin text-gray-500' />
          <div className='text-2xl'>loading...</div>
        </div>
      ) : fileItems.length === 0 ? (
        <div className='mt-24 flex w-full flex-col items-center gap-8'>
          <img alt='No content' width={300} height={300} src='/empty.svg' />
          <p className='text-gray-500'>This folder is empty.</p>
        </div>
      ) : (
        <div className='container mx-auto px-4 py-8'>
          <ItemListContainer
            fileItems={fileItems}
            selectedView={selectedView}
          />
        </div>
      )}
    </>
  )
}

export default DriveContainer
