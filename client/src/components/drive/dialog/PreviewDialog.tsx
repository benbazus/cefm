import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { FileItem } from '@/types/types'

interface PreviewDialogProps {
  previewFile: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export default function PreviewDialog({
  previewFile,
  isOpen,
  onClose,
}: PreviewDialogProps) {
  if (!previewFile) return null

  return (
    <div className='flex items-center space-x-2'>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className='aspect-video'>
            <iframe
              src={`/api/files/preview/${previewFile?.id}`}
              className='h-full w-full border-0'
              title={`Preview of ${previewFile?.name}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
