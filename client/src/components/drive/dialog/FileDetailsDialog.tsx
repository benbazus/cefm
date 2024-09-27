import { Button } from '@/components/custom/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { FileItem } from '@/types/types'
interface FileDetailsDialogProps {
  fileDetails: FileItem | null
  onCancel: () => void
}

export const FileDetailsDialog: React.FC<FileDetailsDialogProps> = ({
  fileDetails,
  onCancel,
}) => {
  return (
    <Dialog open={!!fileDetails} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>File Details</DialogTitle>
          </div>
        </DialogHeader>
        {fileDetails && (
          <div>
            <p>Name: {fileDetails.name}</p>
            <p>Uploaded by: {fileDetails.type || 'N/A'}</p>
            <p>Location: {fileDetails.type || 'N/A'}</p>
            <p>Type: {fileDetails.type}</p>
            <p>Size: {fileDetails.size} bytes</p>
            <p>Uploaded: {new Date(fileDetails.createdAt).toLocaleString()}</p>
            <p>Modified: {new Date(fileDetails.updatedAt).toLocaleString()}</p>
            <p>MIME type: {fileDetails.mimeType || 'N/A'}</p>
            <p>Shared: {fileDetails.sharedWith || 'N/A'}</p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onCancel}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
