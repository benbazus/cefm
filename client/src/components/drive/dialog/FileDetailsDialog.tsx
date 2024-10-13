import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { FolderFileItem } from '@/types/types'

interface FileDetailsSheetProps {
  fileDetails: FolderFileItem | null
  fileType?: 'file' | 'folder' | null
  isOpen: boolean
  onClose: () => void
}

export const FileDetailsSheet: React.FC<FileDetailsSheetProps> = ({
  fileDetails,
  fileType,
  isOpen,
  onClose,
}) => {
  console.log(' ++++++++++++++++ ')
  console.log(fileDetails)
  console.log(' ++++++++++++++++ ')

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <div className='flex items-center justify-between'>
            <SheetTitle>
              {fileType === 'folder' ? 'Folder' : 'File'} Details
            </SheetTitle>
          </div>
        </SheetHeader>
        {fileDetails && (
          <div className='mt-4 space-y-2'>
            {fileType === 'file' ? (
              // File-specific details
              <>
                <p>
                  <strong>File Name:</strong> {fileDetails.name}
                </p>
                <p>
                  <strong>File Size:</strong> {fileDetails.size} bytes
                </p>
                <p>
                  <strong>MIME type:</strong> {fileDetails.mimeType || 'N/A'}
                </p>
              </>
            ) : (
              // Folder-specific details
              <>
                <p>
                  <strong>Folder Name:</strong> {fileDetails.name}
                </p>
                <p>
                  <strong>Total Files:</strong>{' '}
                  {fileDetails.numberOfFiles || 'N/A'}
                </p>
                <p>
                  <strong>Total Sub Folders:</strong>{' '}
                  {fileDetails.numberOfSubfolders || 'N/A'}
                </p>
                <p>
                  <strong>Folder Size:</strong>{' '}
                  {fileDetails.totalFileSize || 'N/A'}
                </p>
              </>
            )}
            <p>
              <strong>Location:</strong> {fileDetails.location || 'N/A'}
            </p>
            <p>
              <strong>Created:</strong>{' '}
              {new Date(fileDetails.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Modified:</strong>{' '}
              {new Date(fileDetails.updatedAt).toLocaleString()}
            </p>
            <p>
              <strong>Owner:</strong> {fileDetails.ownerId || 'N/A'}
            </p>
            <p>
              <strong>Locked:</strong> {fileDetails.locked ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Shared:</strong> {fileDetails.isShared ? 'Yes' : 'No'}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
