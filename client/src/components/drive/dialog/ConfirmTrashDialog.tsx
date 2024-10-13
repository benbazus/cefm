import React, { useState } from 'react'
import { Button } from '@/components/custom/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileItem } from '@/types/types'
import { useToast } from '@/components/ui/use-toast'
import { moveToTrash, moveFolderToTrash } from '@/services/api'

interface ConfirmTrashDialogProps {
  confirmTrashFile: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export const ConfirmTrashDialog: React.FC<ConfirmTrashDialogProps> = ({
  confirmTrashFile,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const confirmMoveToTrash = async () => {
    setIsLoading(true)
    if (!confirmTrashFile) return
    try {
      if (confirmTrashFile.type === 'file') {
        await moveToTrash(confirmTrashFile.id)
      } else {
        await moveFolderToTrash(confirmTrashFile.id)
      }
      toast({
        title: 'Trash',
        description: `Moved ${confirmTrashFile.name} to trash`,
      })
      onClose()
    } catch (error) {
      console.error('Move to trash error:', error)
      toast({
        title: 'Error',
        description: 'Failed to move file to trash',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!confirmTrashFile) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Move to Trash</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <p>
              Are you sure you want to move "{confirmTrashFile.name}" to trash?
            </p>
          </div>
          <DialogFooter>
            <Button variant='secondary' disabled={isLoading} onClick={onClose}>
              Close
            </Button>
            <Button
              type='submit'
              variant='destructive'
              onClick={confirmMoveToTrash}
              disabled={isLoading}
            >
              {isLoading ? 'Moving file to Trash...' : 'Move to Trash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
