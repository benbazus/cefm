import React from 'react'
import { FileItem } from '@/types/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { format } from 'date-fns'
import { formatSize } from '@/utils/helpers'
import { FileActionMenu } from '../drive/drive-button'

interface ItemGridProps {
  items: FileItem[]
  selectedFile: string | null
  isDocumentPage: boolean
  isTrashPage: boolean
  isSharePage: boolean
  getFileIcon: (file: FileItem) => JSX.Element
  handleFileClick: (id: string) => void
  handleDoubleClick: (file: FileItem) => void
  handlePreview: (file: FileItem) => void
  handleCopyLink: (file: FileItem) => void
  handleMakeCopy: (file: FileItem) => void
  handleLockItem: (file: FileItem) => void
  handleVersionItem: (file: FileItem) => void
  handleMoveItem: (file: FileItem) => void
  handleDownload: (file: FileItem) => void
  handleShare: (file: FileItem) => void
  handleRename: (file: FileItem) => void
  handleDetails: (file: FileItem) => void
  handleMoveToTrash: (file: FileItem) => void
  handleRestoreTrash: (file: FileItem) => void
  handleDeletePermanently: (file: FileItem) => void
  handleStopSharing: (file: FileItem) => void
  handleMoveFileItem: (file: FileItem) => void
}

const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  selectedFile,
  isDocumentPage,
  isTrashPage,
  isSharePage,
  getFileIcon,
  handleFileClick,
  handleDoubleClick,
  handlePreview,
  handleCopyLink,
  handleMakeCopy,
  handleLockItem,
  handleVersionItem,
  handleMoveItem,
  handleDownload,
  handleShare,
  handleRename,
  handleDetails,
  handleMoveToTrash,
  handleRestoreTrash,
  handleDeletePermanently,
  handleStopSharing,
  handleMoveFileItem,
}) => {
  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
      {items.map((file) => (
        <Card
          key={file.id}
          className={`group relative transition-colors duration-200 hover:border-primary ${
            file.id === selectedFile ? 'border-primary' : ''
          }`}
        >
          {!isDocumentPage && (
            <div className='absolute right-2 top-2 z-10'>
              <FileActionMenu
                file={file}
                onPreview={handlePreview}
                onCopyLink={handleCopyLink}
                onMakeCopy={handleMakeCopy}
                onLockItem={handleLockItem}
                onVersionItem={handleVersionItem}
                onMoveItem={handleMoveItem}
                onDownload={handleDownload}
                onShare={handleShare}
                onRename={handleRename}
                onDetails={handleDetails}
                onMoveToTrash={handleMoveToTrash}
                onMoveFileItem={handleMoveFileItem}
                onRestoreTrash={handleRestoreTrash}
                onDeletePermanently={handleDeletePermanently}
                onStopSharing={handleStopSharing}
                isTrashPage={isTrashPage}
                isSharePage={isSharePage}
              />
            </div>
          )}
          <CardContent className='p-4'>
            <div
              role='button'
              tabIndex={0}
              onClick={() => handleFileClick(file.id)}
              onDoubleClick={() => handleDoubleClick(file)}
              className='flex flex-col items-center'
            >
              {getFileIcon(file)}
              <span className='sr-only'>{`${file.type} - ${file.mimeType} - ${file.name}`}</span>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col items-start justify-between border-t p-2'>
            <span
              className='w-full truncate text-sm font-medium'
              title={file.name}
            >
              {file.name}
            </span>
            <div className='flex w-full items-center justify-between text-xs text-muted-foreground'>
              <span>{formatSize(file.size)}</span>
              <span>{format(new Date(file.updatedAt), 'MMM d, yyyy')}</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default ItemGrid
