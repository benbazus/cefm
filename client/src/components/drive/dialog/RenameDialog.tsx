import { Button } from '@/components/custom/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { FileItem } from '@/types/types'

interface RenameDialogProps {
  renameFile: FileItem | null
  newFileName: string
  onCancel: () => void
  onConfirm: () => void
  setNewFileName: (name: string) => void
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  renameFile,
  newFileName,
  onCancel,
  onConfirm,
  setNewFileName,
}) => {
  return (
    <Dialog open={!!renameFile} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        <Input
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder='Enter new file name'
        />
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
