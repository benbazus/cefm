import React, { useMemo, useState } from 'react'
import { FileItem, FolderFileItem } from '@/types/types'

import { encodeFolderId } from '@/utils/helpers'
import { useToast } from '@/components/ui/use-toast'

import { useLocation, useNavigate } from 'react-router-dom'

import { useFolder } from '@/contexts/FolderContext'
import { ShareDialog } from './dialog/ShareDialog'
import { RenameDialog } from './dialog/RenameDialog'
import { FileDetailsSheet } from './dialog/FileDetailsDialog'
import { ConfirmTrashDialog } from './dialog/ConfirmTrashDialog'
import { useFolderFile } from '@/contexts/FileFolderContext'
import {
  downloadItem,
  copyShareLink,
  getFileDetails,
  deletePermanently,
  restoreFile,
  copyFile,
  getFolderDetails,
  copyFolder,
  restoreFolder,
  deleteFolderPermanently,
} from '@/services/api'
import PreviewDialog from './dialog/PreviewDialog'

import LockDialog from './dialog/LockDialog'
import MoveItemDialog from './dialog/MoveitemDialog'
import VersionsDialog from './dialog/VersionsDialog'
import FileTable from '../drive-items/FileTable'
import ItemGrid from '../drive-items/ItemGrid'
import FileIcon from '../drive-items/FileIcon'
import { MoveFolderDialog } from './dialog/MoveFolderDialog'
interface GridContainerProps {
  fileItems: FileItem[]
  selectedView: {
    contentType: string
    viewType: string
  }
}

const ItemListContainer: React.FC<GridContainerProps> = ({
  fileItems,
  selectedView,
}) => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [confirmTrashFile, setConfirmTrashFile] = useState<FileItem | null>(
    null
  )
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null)
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isFileDetailsSheetOpen, setIsFileDetailsSheetOpen] = useState(false)
  const [isMoveItemToTrashDialogOpen, setIsMoveItemToTrashDialogOpen] =
    useState(false)
  const [fileType, setFileType] = useState<'file' | 'folder' | null>(null)
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [renameFile, setRenameFile] = useState<FileItem | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [fileDetails, setFileDetails] = useState<FolderFileItem | null>(null)

  const location = useLocation()
  const { triggerRefresh } = useFolderFile()
  const { setFolderId, setFolderName } = useFolder()
  const navigate = useNavigate()
  const { toast } = useToast()

  const isTrashPage = window.location.pathname === '/drive/trash'
  const isSharePage = window.location.pathname === '/drive/share'
  const isDocumentPage = location.pathname.startsWith('/drive/document')

  const handleFileClick = (id: string) => {
    setSelectedFile(id === selectedFile ? null : id)
  }

  const handleDoubleClick = async (file: FileItem) => {
    if (file.type === 'folder') {
      const encodedFolderId = encodeFolderId(file.id)
      setFolderId(file.id)
      setFolderName(file.name)

      navigate(`/drive/folders/${encodedFolderId}`)
    } else if (file.mimeType === 'application/pdf') {
      try {
        handlePreview(file)
        //   const fileResponse = await previewAFile(file.id)
        //  setPreviewUrl(fileResponse.fileUrl)
        //  setFileUrl(fileResponse.fileUrl)
      } catch (error) {
        console.error('Error previewing file:', error)
        toast({
          title: 'Error',
          variant: 'destructive',
          description: `Failed to preview ${file.name}`,
        })
      }
    } else if (file.mimeType === 'application/doc') {
      const id = encodeFolderId(file.id)
      window.open(`/document/e/${id}/edit`, '_blank')
    } else {
      toast({
        title: 'Information',
        variant: 'default',
        description: `This file ${file.name} cannot be previewed`,
      })
    }
  }

  const handleCopyLink = async (file: FileItem) => {
    try {
      const shareLink = await copyShareLink(file.id)
      await navigator.clipboard.writeText(shareLink)
      toast({
        title: 'Link Copied',
        description: `Share link for ${file.name} copied to clipboard`,
      })
    } catch (error) {
      console.error('Copy link error:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      })
    }
  }

  const handlePreview = (file: FileItem) => {
    if (
      file.mimeType === 'application/pdf' ||
      file.mimeType.startsWith('image/')
    ) {
      setIsPreviewDialogOpen(true)
      setPreviewFile(file)
    } else {
      toast({
        title: 'Preview not available',
        description: `Preview is only available for PDF and image files.`,
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      if (file.type === 'file') {
        await downloadItem(true, file.id, file.name)
      } else {
        await downloadItem(false, file.id, file.name)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  const handleShare = (file: FileItem) => {
    setShareFile(file)
    setIsShareDialogOpen(true)
  }

  const handleMakeCopy = async (file: FileItem) => {
    console.log('Make copy:', file)

    if (file.type === 'file') {
      await copyFile(file?.id)
    } else {
      setFileType('folder')
      await copyFolder(file?.id)
    }
    triggerRefresh()
  }

  const handleLockItem = (file: FileItem) => {
    console.log('Lock item:', file)
    if (file.type === 'file') {
      setSelectedItem(file)
      setIsLockDialogOpen(true)
    }
  }

  const handleVersionItem = (file: FileItem) => {
    console.log('Version item:', file)

    if (file.type === 'file') {
      setSelectedItem(file)
      setIsVersionsDialogOpen(true)
    }
  }

  const handleMoveItem = (file: FileItem) => {
    console.log('Move item:', file)
    // if (file.type === 'file') {
    setSelectedItem(file)
    setIsMoveDialogOpen(true)
    // }
  }

  const handleRename = (file: FileItem) => {
    setRenameFile(file)
    setNewFileName(file.name)

    // const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.')
    //setNewFileName(nameWithoutExtension)

    setIsRenameDialogOpen(true)
  }

  const handleDetails = async (file: FileItem) => {
    try {
      let details

      if (file.type === 'file') {
        setFileType('file')
        details = (await getFileDetails(file.id)) as FolderFileItem
      } else {
        setFileType('folder')
        details = (await getFolderDetails(file.id)) as FolderFileItem
      }

      setIsFileDetailsSheetOpen(true)
      setFileDetails(details)
    } catch (error) {
      console.error('Details error:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch file details',
        variant: 'destructive',
      })
    }
  }

  const handleMoveFileItem = (file: FileItem) => {
    setSelectedItem(file)
    setIsMoveItemToTrashDialogOpen(true)
  }

  const handleMoveToTrash = (file: FileItem) => {
    setConfirmTrashFile(file)

    triggerRefresh()
  }

  const handleRestoreTrash = async (file: FileItem) => {
    try {
      if (file.type === 'file') {
        await restoreFile(file.id)
      } else {
        await restoreFolder(file.id)
      }

      triggerRefresh()
      toast({
        title: 'Restore',
        description: `Restored ${file.name} from trash`,
      })
    } catch (error) {
      console.error('Restore error:', error)
      toast({
        title: 'Error',
        description: 'Failed to restore item from trash',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePermanently = async (file: FileItem) => {
    try {
      if (file.type === 'file') {
        console.log(' ++++++FILE+++++++++++ ')
        await deletePermanently(true, file.id)
      } else {
        console.log(' ++++++++FOLDER++++++++++++ ')
        await deleteFolderPermanently(file.id)
      }

      toast({
        title: 'Delete',
        description: `Permanently deleted ${file.name}`,
      })
      triggerRefresh()
    } catch (error) {
      console.error('Delete permanently error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete file permanently',
        variant: 'destructive',
      })
    }
  }

  const handleStopSharing = (file: FileItem) => {
    console.log('Stopping sharing for file:', file)
    // Add logic for stopping sharing
    toast({
      title: 'Not Implemented',
      description: 'Stop sharing functionality is not yet implemented',
      variant: 'default',
    })
  }

  const memoizedFiles = useMemo(
    () => fileItems.filter((item) => item.type === 'file'),
    [fileItems]
  )
  const memoizedFolders = useMemo(
    () => fileItems.filter((item) => item.type === 'folder'),
    [fileItems]
  )

  const showItemList = () => {
    return (
      <FileTable
        fileItems={fileItems}
        getFileIcon={(file) => <FileIcon file={file} />}
        isTrashPage={isTrashPage}
        isSharePage={isSharePage}
        handlePreview={handlePreview}
        handleCopyLink={handleCopyLink}
        handleMakeCopy={handleMakeCopy}
        handleLockItem={handleLockItem}
        handleVersionItem={handleVersionItem}
        handleMoveItem={handleMoveItem}
        handleMoveFileItem={handleMoveFileItem}
        handleDownload={handleDownload}
        handleShare={handleShare}
        handleRename={handleRename}
        handleDetails={handleDetails}
        handleMoveToTrash={handleMoveToTrash}
        handleRestoreTrash={handleRestoreTrash}
        handleDeletePermanently={handleDeletePermanently}
        handleStopSharing={handleStopSharing}
      />
    )
  }

  const showItemGrid = (items: FileItem[]) => {
    return (
      <ItemGrid
        items={items}
        selectedFile={selectedFile}
        isDocumentPage={isDocumentPage}
        isTrashPage={isTrashPage}
        isSharePage={isSharePage}
        getFileIcon={(file) => <FileIcon file={file} />}
        handleFileClick={handleFileClick}
        handleDoubleClick={handleDoubleClick}
        handlePreview={handlePreview}
        handleCopyLink={handleCopyLink}
        handleMakeCopy={handleMakeCopy}
        handleLockItem={handleLockItem}
        handleVersionItem={handleVersionItem}
        handleMoveFileItem={handleMoveFileItem}
        handleMoveItem={handleMoveItem}
        handleDownload={handleDownload}
        handleShare={handleShare}
        handleRename={handleRename}
        handleDetails={handleDetails}
        handleMoveToTrash={handleMoveToTrash}
        handleRestoreTrash={handleRestoreTrash}
        handleDeletePermanently={handleDeletePermanently}
        handleStopSharing={handleStopSharing}
      />
    )
  }

  const showItemDetails = () => {
    const items =
      selectedView.contentType === 'files' ? memoizedFiles : memoizedFolders
    return (
      <div className='px-2'>
        {selectedView.viewType === 'grid'
          ? showItemGrid(items)
          : showItemList()}
      </div>
    )
  }

  const handleCloseRenameDialog = () => {
    setIsRenameDialogOpen(false)
    setConfirmTrashFile(null)
    triggerRefresh()
  }

  return (
    <>
      {showItemDetails()}

      <MoveFolderDialog
        isOpen={isMoveItemToTrashDialogOpen}
        onClose={() => {
          setIsMoveItemToTrashDialogOpen(false)
          triggerRefresh()
        }}
        file={selectedItem}
        onMoved={() => {
          setIsMoveItemToTrashDialogOpen(false)
          triggerRefresh()
        }}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => {
          setIsShareDialogOpen(false)
          triggerRefresh()
        }}
        file={shareFile}
      />

      <PreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        previewFile={previewFile}
      />

      <ConfirmTrashDialog
        isOpen={!!confirmTrashFile}
        onClose={() => {
          setConfirmTrashFile(null)
          triggerRefresh()
        }}
        confirmTrashFile={confirmTrashFile}
      />

      <RenameDialog
        isOpen={isRenameDialogOpen}
        onClose={handleCloseRenameDialog}
        renameFile={renameFile}
        newFileName={newFileName}
        setNewFileName={setNewFileName}
      />

      <FileDetailsSheet
        isOpen={isFileDetailsSheetOpen}
        onClose={() => {
          setIsFileDetailsSheetOpen(false)
          triggerRefresh()
        }}
        fileDetails={fileDetails}
        fileType={fileType}
      />

      <MoveItemDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        item={selectedItem}
        onMove={() => {
          setIsMoveDialogOpen(false)
          triggerRefresh()
        }}
      />

      <VersionsDialog
        isOpen={isVersionsDialogOpen}
        onClose={() => setIsVersionsDialogOpen(false)}
        file={selectedItem}
        onVersionRestored={() => {
          setIsVersionsDialogOpen(false)
          triggerRefresh()
        }}
      />

      <LockDialog
        isOpen={isLockDialogOpen}
        onClose={() => setIsLockDialogOpen(false)}
        item={selectedItem}
        onLockStatusChanged={() => {
          setIsLockDialogOpen(false)
          triggerRefresh()
        }}
      />
    </>
  )
}

export default ItemListContainer
