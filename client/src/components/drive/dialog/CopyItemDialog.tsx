// import React, { useState, useEffect } from 'react'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'

// import { FileItem } from '@/types/types'
// import { copyItems, listFiles } from '@/services/api'

// interface CopyItemDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   item: FileItem | null
//   onCopy: () => void
// }

// const CopyItemDialog: React.FC<CopyItemDialogProps> = ({
//   isOpen,
//   onClose,
//   item,
//   onCopy,
// }) => {
//   const [folders, setFolders] = useState<FileItem[]>([])
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchFolders = async () => {
//       try {
//         const allItems = await listFiles()
//         const folderItems = allItems.filter(
//           (fileItem: FileItem) => fileItem.type === 'folder'
//         )
//         setFolders(folderItems)
//       } catch (error) {
//         console.error('Error fetching folders:', error)
//       }
//     }

//     if (isOpen) {
//       fetchFolders()
//     }
//   }, [isOpen])

//   const handleCopy = async () => {
//     if (item && selectedFolder) {
//       try {
//         await copyItems(item.id, selectedFolder, item.type === 'folder')
//         onCopy()
//         onClose()
//       } catch (error) {
//         console.error('Error copying item:', error)
//       }
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>
//             Copy {item?.type === 'folder' ? 'Folder' : 'File'}
//           </DialogTitle>
//         </DialogHeader>
//         <div className='mt-4'>
//           <h3 className='text-lg font-medium'>Select destination folder:</h3>
//           <ul className='mt-2 space-y-2'>
//             {folders.map((folder) => (
//               <li key={folder.id}>
//                 <label className='flex items-center space-x-2'>
//                   <input
//                     type='radio'
//                     name='folder'
//                     value={folder.id}
//                     checked={selectedFolder === folder.id}
//                     onChange={() => setSelectedFolder(folder.id)}
//                     className='form-radio'
//                   />
//                   <span>{folder.name}</span>
//                 </label>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className='mt-4 flex justify-end space-x-2'>
//           <Button variant='outline' onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleCopy} disabled={!selectedFolder}>
//             Copy
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default CopyItemDialog
