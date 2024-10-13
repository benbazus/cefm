import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { FileItem } from '@/types/types'

interface FileDetailsSheetProps {
  fileDetails: FileItem | null
  onCancel: () => void
}

export const FileDetailsSheet: React.FC<FileDetailsSheetProps> = ({
  fileDetails,
  onCancel,
}) => {
  return (
    <Sheet open={!!fileDetails} onOpenChange={onCancel}>
      <SheetContent>
        <SheetHeader>
          <div className='flex items-center justify-between'>
            <SheetTitle>File Details</SheetTitle>
          </div>
        </SheetHeader>
        {fileDetails && (
          <div className='mt-4 space-y-2'>
            <p>
              <strong>Name:</strong> {fileDetails.name}
            </p>
            <p>
              <strong>Uploaded by:</strong> {fileDetails.type || 'N/A'}
            </p>
            <p>
              <strong>Location:</strong> {fileDetails.type || 'N/A'}
            </p>
            <p>
              <strong>Type:</strong> {fileDetails.type}
            </p>
            <p>
              <strong>Size:</strong> {fileDetails.size} bytes
            </p>
            <p>
              <strong>Uploaded:</strong>{' '}
              {new Date(fileDetails.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Modified:</strong>{' '}
              {new Date(fileDetails.updatedAt).toLocaleString()}
            </p>
            <p>
              <strong>MIME type:</strong> {fileDetails.mimeType || 'N/A'}
            </p>
            <p>
              <strong>Shared:</strong> {fileDetails.sharedWith || 'N/A'}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
