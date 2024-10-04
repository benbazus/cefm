import React, { useMemo, useState } from 'react'
import { FileItem } from '@/types/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  PaginationState,
} from '@tanstack/react-table'

import {
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  File,
  FileSpreadsheet,
  FileCode,
  FileArchive,
} from 'lucide-react'
import { encodeFolderId, formatSize } from '@/utils/helpers'
import { useToast } from '@/components/ui/use-toast'

import { addDays, format } from 'date-fns'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Checkbox } from '@/components/ui/checkbox'

import { Button } from '../custom/button'

import { useFolder } from '@/contexts/FolderContext'
import { ShareDialog } from './dialog/ShareDialog'
import { RenameDialog } from './dialog/RenameDialog'
import { FileDetailsDialog } from './dialog/FileDetailsDialog'
import { FileActionMenu } from './drive-button'
import { ConfirmTrashDialog } from './dialog/ConfirmTrashDialog'
import { useFolderFile } from '@/contexts/FileFolderContext'
import {
  downloadItem,
  copyShareLink,
  getFileDetails,
  renameAFile,
  moveToTrash,
  shareAFile,
  deletePermanently,
  restoreFile,
} from '@/services/api'
import PreviewDialog from './dialog/PreviewDialog'
import { IconFileText, IconFileZip } from '@tabler/icons-react'

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
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [confirmTrashFile, setConfirmTrashFile] = useState<FileItem | null>(
    null
  )
  const location = useLocation()
  const [shareWithMessage, setShareWithMessage] = useState('')
  const [sharedWith, setSharedWith] = useState('')
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [renameFile, setRenameFile] = useState<FileItem | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [fileDetails, setFileDetails] = useState<FileItem | null>(null)
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false)
  const [password, setPassword] = useState('')
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(false)
  const [expirationDate, setExpirationDate] = useState(
    format(addDays(new Date(), 7), 'yyyy-MM-dd')
  )
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const pathnames = location.pathname.split('/').filter((x) => x)

  const { triggerRefresh } = useFolderFile()
  const { setFolderId, setFolderName } = useFolder()
  const navigate = useNavigate()
  const { toast } = useToast()

  const isTrashPage = window.location.pathname === '/drive/trash'
  const isSharePage = window.location.pathname === '/drive/share'

  const getFileIcon = useMemo(
    () => (file: FileItem) => {
      if (file.type === 'folder')
        return <Folder className='h-12 w-12 text-yellow-500' />

      switch (file.mimeType) {
        case 'application/pdf':
          return <FileText className='h-12 w-12 text-red-500' />
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
          return <FileImage className='h-12 w-12 text-green-500' />
        case 'audio/mpeg':
        case 'audio/wav':
          return <FileAudio className='h-12 w-12 text-purple-500' />
        case 'video/mp4':
        case 'video/mpeg':
          return <FileVideo className='h-12 w-12 text-blue-500' />
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return <FileSpreadsheet className='h-12 w-12 text-green-600' />
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return <FileText className='h-12 w-12 text-blue-700' />
        case 'application/x-msdownload':
          return <FileCode className='h-12 w-12 text-red-600' />
        case 'application/x-zip-compressed':
          return <FileArchive className='h-12 w-12 text-yellow-600' />
        case 'application/doc':
          return <IconFileText className='h-12 w-12 text-green-600' />
        case 'application/x-compressed':
          return <IconFileZip className='h-12 w-12 text-green-600' />
        default:
          return <File className='h-12 w-12 text-green-500' />
      }
    },
    []
  )

  const isDocumentPage = location.pathname.startsWith('/drive/document')

  const handleFileClick = (id: string) => {
    setSelectedFile(id === selectedFile ? null : id)
  }

  const handleDoubleClick = async (file: FileItem) => {
    if (file.type === 'folder') {
      const encodedFolderId = encodeFolderId(file.id)
      setFolderId(file.id)
      setFolderName(file.name)

      console.log(' ======= handleDoubleClick =========== ')
      console.log(file.name)
      console.log(pathnames)
      console.log(' ======= handleDoubleClick ======== ')

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
    resetShareDialog()
  }

  const resetShareDialog = () => {
    setIsExpirationEnabled(false)
    setIsPasswordEnabled(false)
    setPassword('')
    setExpirationDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'))
  }

  const validateShareInputs = (): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd')

    if (isExpirationEnabled && expirationDate < today) {
      toast({
        title: 'Expiration Date',
        description: `Expiration date cannot be in the past.`,
        variant: 'destructive',
      })
      return false
    }

    if (isPasswordEnabled && (!password || password.length < 6)) {
      toast({
        title: 'Password',
        description: `Password must be at least 6 characters.`,
        variant: 'destructive',
      })
      return false
    }

    if (!sharedWith) {
      toast({
        title: 'Provide Email',
        description: `Please provide an email address to share with`,
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const confirmShare = async () => {
    if (!validateShareInputs()) return
    setLoading(true)

    try {
      if (!shareFile) return

      await shareAFile(
        shareFile.id,
        expirationDate,
        password,
        sharedWith,
        shareWithMessage,
        isPasswordEnabled,
        isExpirationEnabled
      )

      toast({
        title: 'Share',
        variant: 'success',
        description: `File shared successfully with ${sharedWith}`,
      })

      setShareFile(null)
    } catch (error) {
      setLoading(false)
      console.error('Share error:', error)
      toast({
        title: 'Error',
        description: 'Failed to share file',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRename = (file: FileItem) => {
    setRenameFile(file)
    setNewFileName(file.name)
  }

  const confirmRename = async () => {
    if (!renameFile) return
    try {
      await renameAFile(renameFile.id, newFileName)
      toast({
        title: 'Rename',
        description: `Renamed ${renameFile.name} to ${newFileName}`,
      })
      setRenameFile(null)
      triggerRefresh()
    } catch (error) {
      console.error('Rename error:', error)
      toast({
        title: 'Error',
        description: 'Failed to rename file',
        variant: 'destructive',
      })
    }
  }

  const handleDetails = async (file: FileItem) => {
    try {
      const details = await getFileDetails(file.id)
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

  const handleMoveToTrash = (file: FileItem) => {
    setConfirmTrashFile(file)
  }

  const confirmMoveToTrash = async () => {
    if (!confirmTrashFile) return
    try {
      await moveToTrash(confirmTrashFile.id)
      toast({
        title: 'Trash',
        description: `Moved ${confirmTrashFile.name} to trash`,
      })
      setConfirmTrashFile(null)
      triggerRefresh()
    } catch (error) {
      console.error('Move to trash error:', error)
      toast({
        title: 'Error',
        description: 'Failed to move file to trash',
        variant: 'destructive',
      })
    }
  }

  const handleRestoreTrash = async (file: FileItem) => {
    try {
      if (file.type === 'file') {
        await restoreFile(true, file.id)
      } else {
        await restoreFile(false, file.id)
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
        description: 'Failed to restore file from trash',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePermanently = async (file: FileItem) => {
    try {
      if (file.type === 'file') {
        await deletePermanently(true, file.id)
      } else {
        await deletePermanently(false, file.id)
      }
      triggerRefresh()
      toast({
        title: 'Delete',
        description: `Permanently deleted ${file.name}`,
      })
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

  const columns: ColumnDef<FileItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className='flex items-center'>
          {getFileIcon(row.original)}
          <span className='ml-2'>{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => {
        const size = row.getValue('size') as number
        if (row.original.type === 'folder') return '-'
        const formattedSize =
          size < 1024
            ? `${size} B`
            : size < 1024 * 1024
              ? `${(size / 1024).toFixed(2)} KB`
              : `${(size / (1024 * 1024)).toFixed(2)} MB`
        return formattedSize
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return format(new Date(date), 'MMM d, yyyy')
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Modified',
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date
        return format(new Date(date), 'MMM d, yyyy')
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original

        return (
          <FileActionMenu
            file={item}
            onPreview={handlePreview}
            onCopyLink={handleCopyLink}
            onDownload={handleDownload}
            onShare={handleShare}
            onRename={handleRename}
            onDetails={handleDetails}
            onMoveToTrash={handleMoveToTrash}
            onRestoreTrash={handleRestoreTrash}
            onDeletePermanently={handleDeletePermanently}
            onStopSharing={handleStopSharing}
            isTrashPage={isTrashPage}
            isSharePage={isSharePage}
          />
        )
      },
    },
  ]

  const table = useReactTable({
    data: fileItems,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    pageCount: Math.ceil(fileItems.length / pagination.pageSize),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  })

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
      <div>
        <div className='flex items-center py-4'>
          <Input
            placeholder='Filter by name...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='max-w-sm'
          />
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-between space-x-2 py-4'>
          <div className='flex-1 text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const showItemGrid = (items: FileItem[]) => {
    return (
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
        {items.map((file) => (
          <Card
            key={file.id}
            className={`group relative transition-colors duration-200 hover:border-primary ${
              file.id === selectedFile ? 'border-primary' : ''
            }`}
          >
            {!isDocumentPage && (
              <div className='absolute right-2 top-2 z-10'>
                <FileActionMenu
                  file={file}
                  onPreview={handlePreview}
                  onCopyLink={handleCopyLink}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onRename={handleRename}
                  onDetails={handleDetails}
                  onMoveToTrash={handleMoveToTrash}
                  onRestoreTrash={handleRestoreTrash}
                  onDeletePermanently={handleDeletePermanently}
                  onStopSharing={handleStopSharing}
                  isTrashPage={isTrashPage}
                  isSharePage={isSharePage}
                />
              </div>
            )}
            <CardContent className='p-4'>
              <div
                role='button'
                tabIndex={0}
                onClick={() => handleFileClick(file.id)}
                onDoubleClick={() => handleDoubleClick(file)}
                className='flex flex-col items-center'
              >
                {getFileIcon(file)}
                <span className='sr-only'>{`${file.type} - ${file.mimeType} - ${file.name}`}</span>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col items-start justify-between border-t p-2'>
              <span
                className='w-full truncate text-sm font-medium'
                title={file.name}
              >
                {file.name}
              </span>
              <div className='flex w-full items-center justify-between text-xs text-muted-foreground'>
                <span>
                  {file.type === 'folder'
                    ? `${file.fileCount || 0} items`
                    : formatSize(file.size)}
                </span>
                <span>{format(new Date(file.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const showItemDetails = () => {
    const items =
      selectedView.contentType === 'files' ? memoizedFiles : memoizedFolders
    return (
      //  <div className='container mx-auto px-4 py-12'>
      //   {selectedView.viewType === 'grid'
      //     ? showItemGrid(items)
      //     : showItemList()}
      // </div>

      <div className='px-2'>
        {selectedView.viewType === 'grid'
          ? showItemGrid(items)
          : showItemList()}
      </div>
    )
  }

  return (
    <>
      {showItemDetails()}
      <ShareDialog
        shareFile={shareFile}
        sharedWith={sharedWith}
        shareWithMessage={shareWithMessage}
        expirationDate={expirationDate}
        isExpirationEnabled={isExpirationEnabled}
        isPasswordEnabled={isPasswordEnabled}
        isPasswordShown={isPasswordShown}
        password={password}
        loading={loading}
        onCancel={() => setShareFile(null)}
        onConfirm={confirmShare}
        setSharedWith={setSharedWith}
        setShareWithMessage={setShareWithMessage}
        setExpirationDate={setExpirationDate}
        setIsExpirationEnabled={setIsExpirationEnabled}
        setIsPasswordEnabled={setIsPasswordEnabled}
        setIsPasswordShown={setIsPasswordShown}
        setPassword={setPassword}
      />
      <PreviewDialog
        previewFile={previewFile}
        onCancel={() => setPreviewFile(null)}
      />
      <ConfirmTrashDialog
        confirmTrashFile={confirmTrashFile}
        onCancel={() => setConfirmTrashFile(null)}
        onConfirm={confirmMoveToTrash}
      />
      <RenameDialog
        renameFile={renameFile}
        newFileName={newFileName}
        onCancel={() => setRenameFile(null)}
        onConfirm={confirmRename}
        setNewFileName={setNewFileName}
      />
      <FileDetailsDialog
        fileDetails={fileDetails}
        onCancel={() => setFileDetails(null)}
      />
    </>
  )
}

export default ItemListContainer
