import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/custom/button'
import {
  Download,
  Edit,
  Eye,
  Info,
  Link,
  MoreVertical,
  Share2,
  Trash2,
  RefreshCcw,
  XCircle,
} from 'lucide-react'
import { FileItem } from '@/types/types'

interface FileActionMenuProps {
  file: FileItem
  onPreview: (file: FileItem) => void
  onCopyLink: (file: FileItem) => void
  onDownload: (file: FileItem) => void
  onShare: (file: FileItem) => void
  onRename: (file: FileItem) => void
  onDetails: (file: FileItem) => void
  onMoveToTrash: (file: FileItem) => void
  onRestoreTrash: (file: FileItem) => void
  onDeletePermanently: (file: FileItem) => void
  onStopSharing: (file: FileItem) => void // Added for Stop Sharing functionality
  isTrashPage: boolean // Prop to detect if the current page is the trash page
  isSharePage: boolean // Prop to detect if the current page is the share page
}

export const FileActionMenu: React.FC<FileActionMenuProps> = ({
  file,
  onPreview,
  onCopyLink,
  onDownload,
  onShare,
  onRename,
  onDetails,
  onMoveToTrash,
  onRestoreTrash,
  onDeletePermanently,
  onStopSharing,
  isTrashPage,
  isSharePage,
}) => {
  const isFolder = file.type === 'folder' // Check if the file is a folder

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {/* Show "Preview" only if the file is not a folder */}
        {!isFolder && (
          <DropdownMenuItem onClick={() => onPreview(file)}>
            <Eye className='mr-2 h-4 w-4 text-gray-600' />
            Preview
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onCopyLink(file)}>
          <Link className='mr-2 h-4 w-4 text-gray-600' />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload(file)}>
          <Download className='mr-2 h-4 w-4 text-green-600' />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare(file)}>
          <Share2 className='mr-2 h-4 w-4 text-blue-600' />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRename(file)}>
          <Edit className='mr-2 h-4 w-4 text-yellow-600' />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetails(file)}>
          <Info className='mr-2 h-4 w-4 text-gray-600' />
          Details
        </DropdownMenuItem>
        {/* Show "Stop Sharing" only if it's the share page */}
        {isSharePage && (
          <DropdownMenuItem onClick={() => onStopSharing(file)}>
            <Info className='mr-2 h-4 w-4 text-gray-600' />
            Stop Sharing
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {/* Show "Move to Trash" only if it's not a trash page */}
        {!isTrashPage && (
          <DropdownMenuItem
            onClick={() => onMoveToTrash(file)}
            className='text-red-600'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Move to trash
          </DropdownMenuItem>
        )}
        {/* Show "Restore" and "Delete Permanently" only if it's a trash page */}
        {isTrashPage && (
          <>
            <DropdownMenuItem
              onClick={() => onRestoreTrash(file)}
              className='text-blue-600'
            >
              <RefreshCcw className='mr-2 h-4 w-4' />
              Restore
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletePermanently(file)}
              className='text-red-600'
            >
              <XCircle className='mr-2 h-4 w-4' />
              Delete Permanently
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
