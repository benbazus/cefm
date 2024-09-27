import { Button } from '@/components/custom/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { FileItem } from '@/types/types'

interface ConfirmTrashDialogProps {
  confirmTrashFile: FileItem | null
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmTrashDialog({
  confirmTrashFile,
  onCancel,
  onConfirm,
}: ConfirmTrashDialogProps) {
  if (!confirmTrashFile) return null

  return (
    <Dialog open={!!confirmTrashFile} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Move to Trash</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to move "{confirmTrashFile.name}" to trash?</p>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Move to Trash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
