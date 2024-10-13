// import { Button } from '@/components/custom/button'
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { toast } from '@/components/ui/use-toast'
// import { renameFolder, renameAFile } from '@/services/api'
// import { FileItem } from '@/types/types'

// interface RenameDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   renameFile: FileItem | null
//   newFileName: string
//   setNewFileName: (name: string) => void
// }

// export const RenameDialog: React.FC<RenameDialogProps> = ({
//   isOpen,
//   onClose,
//   renameFile,
//   newFileName,
//   setNewFileName,
// }) => {
//   const confirmRename = async () => {
//     if (!renameFile) return
//     try {
//       if (renameFile.type === 'file') {
//         await renameAFile(renameFile.id, newFileName)
//       } else {
//         await renameFolder(renameFile.id, newFileName)
//       }
//       toast({
//         title: 'Rename',
//         description: `Renamed ${renameFile.name} to ${newFileName}`,
//       })
//       onClose()
//     } catch (error) {
//       console.error('Rename error:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to rename file',
//         variant: 'destructive',
//       })
//     }
//   }

//   // Handle onOpenChange properly
//   const handleOpenChange = (open: boolean) => {
//     if (!open) {
//       onClose()
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//       <DialogContent className='sm:max-w-[425px]'>
//         <DialogHeader>
//           <DialogTitle>Rename File</DialogTitle>
//         </DialogHeader>
//         <div className='grid gap-4 py-4'>
//           <Input
//             value={newFileName}
//             onChange={(e) => setNewFileName(e.target.value)}
//             placeholder='Enter new file name'
//           />
//         </div>
//         <DialogFooter>
//           <DialogClose asChild>
//             <Button type='button' variant='secondary'>
//               Close
//             </Button>
//           </DialogClose>
//           <Button onClick={confirmRename}>Rename</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

import { Button } from '@/components/custom/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { renameFolder, renameAFile } from '@/services/api'
import { FileItem } from '@/types/types'

interface RenameDialogProps {
  isOpen: boolean
  onClose: () => void
  renameFile: FileItem | null
  newFileName: string
  setNewFileName: (name: string) => void
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  onClose,
  renameFile,
  newFileName,
  setNewFileName,
}) => {
  // Add this function to extract name without extension
  const getNameWithoutExtension = (fileName: string) => {
    return fileName.split('.').slice(0, -1).join('.')
  }

  // Add this function to get file extension
  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop() || ''
  }

  const confirmRename = async () => {
    if (!renameFile) return
    try {
      const extension = getFileExtension(renameFile.name)
      const newNameWithExtension =
        renameFile.type === 'file' ? `${newFileName}.${extension}` : newFileName

      if (renameFile.type === 'file') {
        await renameAFile(renameFile.id, newNameWithExtension)
      } else {
        await renameFolder(renameFile.id, newNameWithExtension)
      }
      toast({
        title: 'Rename',
        description: `Renamed ${renameFile.name} to ${newNameWithExtension}`,
      })
      onClose()
    } catch (error) {
      console.error('Rename error:', error)
      toast({
        title: 'Error',
        description: 'Failed to rename file',
        variant: 'destructive',
      })
    }
  }

  // Handle onOpenChange properly
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            Rename {renameFile?.type === 'file' ? 'File' : 'Folder'}
          </DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder='Enter new name'
            defaultValue={
              renameFile ? getNameWithoutExtension(renameFile.name) : ''
            }
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Close
            </Button>
          </DialogClose>
          <Button onClick={confirmRename}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
