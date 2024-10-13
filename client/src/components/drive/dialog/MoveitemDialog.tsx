import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DriveItemsResponse, FileItem } from '@/types/types'

import { listFiles, moveItems } from '@/services/api'

interface MoveItemDialogProps {
  isOpen: boolean
  onClose: () => void
  item: FileItem | null
  onMove: () => void
}

const MoveItemDialog: React.FC<MoveItemDialogProps> = ({
  isOpen,
  onClose,
  item,
  onMove,
}) => {
  const [folders, setFolders] = useState<FileItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = (await listFiles()) as DriveItemsResponse

        const fetchedFolders = (response?.folders || []).map((folder) => ({
          id: folder.id,
          name: folder.name,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
          size: folder.size,
          owner: folder.userId,
          type: 'folder' as const,
          mimeType: 'folder',
        }))

        const combinedItems = [...fetchedFolders]

        const uniqueItems = Array.from(
          new Map(combinedItems.map((item) => [item.id, item])).values()
        )

        // console.log(' ===== handleMove ======== ')
        // console.log(uniqueItems)
        // console.log(' ===== handleMove ======== ')

        setFolders(uniqueItems)
      } catch (error) {
        console.error('Error fetching folders:', error)
      }
    }

    if (isOpen) {
      fetchFolders()
    }
  }, [isOpen])

  const handleMove = async () => {
    if (selectedFolder) {
      try {
        console.log(' ===== handleMove ======== ')
        console.log(item?.id)
        console.log(selectedFolder)
        console.log(item?.type)
        console.log(' ===== handleMove ======== ')

        await moveItems(
          item?.id as string,
          selectedFolder,
          item?.type === 'folder'
        )
        onMove()
        onClose()
      } catch (error) {
        console.error('Error moving item:', error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Move {item?.type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <h3 className='text-lg font-medium'>Select destination folder:</h3>
          <ul className='mt-2 space-y-2'>
            {folders.map((folder) => (
              <li key={folder?.id}>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='folder'
                    value={folder?.id}
                    checked={selectedFolder === folder?.id}
                    onChange={() => setSelectedFolder(folder?.id)}
                    className='form-radio'
                  />
                  <span>{folder?.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-4 flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedFolder}>
            Move
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MoveItemDialog
