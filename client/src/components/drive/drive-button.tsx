import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Copy,
  FolderInput,
} from 'lucide-react'
import { FileItem } from '@/types/types'

interface FileActionMenuProps {
  file: FileItem
  onPreview: (file: FileItem) => void
  onCopyLink: (file: FileItem) => void
  onMoveItem: (file: FileItem) => void
  onMakeCopy: (file: FileItem) => void
  onLockItem: (file: FileItem) => void
  onVersionItem: (file: FileItem) => void
  onDownload: (file: FileItem) => void
  onShare: (file: FileItem) => void
  onRename: (file: FileItem) => void
  onDetails: (file: FileItem) => void
  onMoveToTrash: (file: FileItem) => void
  onRestoreTrash: (file: FileItem) => void
  onDeletePermanently: (file: FileItem) => void
  onStopSharing: (file: FileItem) => void
  isTrashPage: boolean // Is the current page a trash page?
  isSharePage: boolean // Is the current page a share page?
}

export const FileActionMenu: React.FC<FileActionMenuProps> = ({
  file,
  onPreview,
  onCopyLink,
  onMakeCopy,
  onLockItem,
  onVersionItem,
  onMoveItem,
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
  const isFolder = file.type === 'folder' // Check if the item is a folder

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {/* When on the Trash page */}
        {isTrashPage && (
          <>
            <DropdownMenuItem onClick={() => onRestoreTrash(file)}>
              <RefreshCcw className='mr-2 h-4 w-4 text-blue-600' />
              Restore
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeletePermanently(file)}>
              <XCircle className='mr-2 h-4 w-4 text-red-600' />
              Delete Permanently
            </DropdownMenuItem>
          </>
        )}

        {/* When on a Share page */}
        {isSharePage && !isTrashPage && (
          <>
            <DropdownMenuItem onClick={() => onDetails(file)}>
              <Info className='mr-2 h-4 w-4 text-gray-600' />
              Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveToTrash(file)}>
              <Trash2 className='mr-2 h-4 w-4 text-red-600' />
              Move to Trash
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStopSharing(file)}
              className='hidden'
            >
              <Info className='mr-2 h-4 w-4 text-gray-600' />
              Stop Sharing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(file)}>
              <Edit className='mr-2 h-4 w-4 text-yellow-600' />
              Rename
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onVersionItem(file)}
              className='hidden'
            >
              <Info className='mr-2 h-4 w-4 text-gray-600' />
              Stop Sharing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLockItem(file)}>
              <Edit className='mr-2 h-4 w-4 text-yellow-600' />
              Lock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(file)}>
              <Download className='mr-2 h-4 w-4 text-green-600' />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMakeCopy(file)}>
              <Copy className='mr-2 h-4 w-4 text-gray-600' />
              Make a Copy
            </DropdownMenuItem>
          </>
        )}

        {/* Default File or Folder actions */}
        {!isSharePage && !isTrashPage && (
          <>
            {/* Show "Preview" only for files, not folders */}
            {!isFolder && (
              <DropdownMenuItem onClick={() => onPreview(file)}>
                <Eye className='mr-2 h-4 w-4 text-gray-600' />
                Preview
              </DropdownMenuItem>
            )}
            {/* Folder or File actions */}
            {isFolder ? (
              <>
                <DropdownMenuItem onClick={() => onDetails(file)}>
                  <Info className='mr-2 h-4 w-4 text-gray-600' />
                  Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRename(file)}>
                  <Edit className='mr-2 h-4 w-4 text-yellow-600' />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(file)}>
                  <Share2 className='mr-2 h-4 w-4 text-blue-600' />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(file)}>
                  <Download className='mr-2 h-4 w-4 text-green-600' />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyLink(file)}>
                  <Link className='mr-2 h-4 w-4 text-gray-600' />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMakeCopy(file)}>
                  <Copy className='mr-2 h-4 w-4 text-gray-600' />
                  Make a Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveItem(file)}>
                  <FolderInput className='mr-2 h-4 w-4 text-gray-600' />
                  Move Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveToTrash(file)}>
                  <Trash2 className='mr-2 h-4 w-4 text-red-600' />
                  Move to Trash
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onDetails(file)}>
                  <Info className='mr-2 h-4 w-4 text-gray-600' />
                  Details
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onRename(file)}>
                  <Edit className='mr-2 h-4 w-4 text-yellow-600' />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(file)}>
                  <Share2 className='mr-2 h-4 w-4 text-blue-600' />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(file)}>
                  <Download className='mr-2 h-4 w-4 text-green-600' />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyLink(file)}>
                  <Link className='mr-2 h-4 w-4 text-gray-600' />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveItem(file)}>
                  <FolderInput className='mr-2 h-4 w-4 text-gray-600' />
                  Move File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMakeCopy(file)}>
                  <Copy className='mr-2 h-4 w-4 text-gray-600' />
                  Make a Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveToTrash(file)}>
                  <Trash2 className='mr-2 h-4 w-4 text-red-600' />
                  Move to Trash
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
