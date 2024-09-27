import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (folderName: string) => void
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateFolder(folderName)
    setFolderName('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder='Enter folder name'
            className='mb-4'
          />
          <DialogFooter>
            <Button type='button' variant='secondary' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
