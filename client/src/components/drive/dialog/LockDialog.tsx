import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { lockItem, unlockItem } from '@/services/api'
import { FileItem } from '@/types/types'

interface LockDialogProps {
  isOpen: boolean
  onClose: () => void
  item: FileItem | null
  onLockStatusChanged: () => void
}

const LockItemDialog: React.FC<LockDialogProps> = ({
  isOpen,
  onClose,
  item,
  onLockStatusChanged,
}) => {
  const handleLock = async () => {
    try {
      await lockItem(item?.id as string, item?.type === 'folder')
      onLockStatusChanged()
      onClose()
    } catch (error) {
      console.error('Error locking item:', error)
    }
  }

  const handleUnlock = async () => {
    try {
      await unlockItem(item?.id as string, item?.type === 'folder')
      onLockStatusChanged()
      onClose()
    } catch (error) {
      console.error('Error unlocking item:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item?.locked ? 'Unlock' : 'Lock'}{' '}
            {item?.type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <p>
            {item?.locked
              ? ` This will prevent anyone from editing or commenting.`
              : `  This will prevent anyone from editing or commenting. Editors can
            unlock the file.`}
          </p>
          <p>
            {item?.locked
              ? `Are you sure you want to unlock "${item?.name}"?`
              : `Are you sure you want to lock "${item?.name}"?`}
          </p>
        </div>
        <div className='mt-4 flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={item?.locked ? handleUnlock : handleLock}>
            {item?.locked ? 'Unlock' : 'Lock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LockItemDialog
