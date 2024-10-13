import { Button } from '@/components/custom/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/custom/dialog'
import { FolderTree } from '@/components/custom/folderTree'
import { getFoldersTree, moveFileItem } from '@/services/api'
import { FileItem } from '@/types/types'

import { useEffect, useState } from 'react'

interface Folder {
  id: string
  name: string
  children: Folder[]
}
interface MoveFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  file: FileItem | null
  onMoved: () => void
}

export function MoveFolderDialog({
  isOpen,
  onClose,
  file,
  onMoved,
}: MoveFolderDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])

  useEffect(() => {
    const fetchFoldersTree = async () => {
      const foldersTree = await getFoldersTree()
      setFolders(foldersTree)
    }
    fetchFoldersTree()
  }, [])

  const handleMove = async () => {
    if (!file?.id || !selectedFolder) return

    // Check if the selected folder is different from the current folder
    if (selectedFolder === file.parentId) {
      console.log('Cannot move to the same folder')
      return
    }

    await moveFileItem(file.id, selectedFolder)
    console.log('Moving to folder:', selectedFolder)
    onMoved()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{file?.name}</DialogTitle>
          <DialogDescription>Select a folder to move to.</DialogDescription>
        </DialogHeader>

        <DialogDescription>
          <FolderTree
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            currentFolderId={file?.parentId}
          />
        </DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedFolder || selectedFolder === file?.parentId}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
