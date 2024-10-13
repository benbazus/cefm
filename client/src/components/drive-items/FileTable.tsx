import React from 'react'
import { FileItem } from '@/types/types'
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
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '../custom/button'
import { FileActionMenu } from '../drive/drive-button'

interface FileTableProps {
  fileItems: FileItem[]
  getFileIcon: (file: FileItem) => JSX.Element
  isTrashPage: boolean
  isSharePage: boolean
  handlePreview: (file: FileItem) => void
  handleCopyLink: (file: FileItem) => Promise<void>
  handleMakeCopy: (file: FileItem) => Promise<void>
  handleLockItem: (file: FileItem) => void
  handleVersionItem: (file: FileItem) => void
  handleMoveItem: (file: FileItem) => void
  handleDownload: (file: FileItem) => Promise<void>
  handleShare: (file: FileItem) => void
  handleRename: (file: FileItem) => void
  handleDetails: (file: FileItem) => Promise<void>
  handleMoveToTrash: (file: FileItem) => void
  handleMoveFileItem: (file: FileItem) => void
  handleRestoreTrash: (file: FileItem) => Promise<void>
  handleDeletePermanently: (file: FileItem) => Promise<void>
  handleStopSharing: (file: FileItem) => void
}

const FileTable: React.FC<FileTableProps> = ({
  fileItems,
  getFileIcon,
  isTrashPage,
  isSharePage,
  handlePreview,
  handleCopyLink,
  handleMakeCopy,
  handleLockItem,
  handleVersionItem,
  handleMoveItem,
  handleDownload,
  handleShare,
  handleRename,
  handleDetails,
  handleMoveToTrash,
  handleMoveFileItem,
  handleRestoreTrash,
  handleDeletePermanently,
  handleStopSharing,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => row.getValue('owner'),
    },
    {
      accessorKey: 'shared',
      header: 'Shared',
      cell: ({ row }) => (row.getValue('shared') ? 'Yes' : 'No'),
    },
    {
      accessorKey: 'locked',
      header: 'Locked',
      cell: ({ row }) => (row.getValue('locked') ? 'Yes' : 'No'),
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
            onMakeCopy={handleMakeCopy}
            onLockItem={handleLockItem}
            onVersionItem={handleVersionItem}
            onMoveItem={handleMoveItem}
            onDownload={handleDownload}
            onShare={handleShare}
            onRename={handleRename}
            onDetails={handleDetails}
            onMoveToTrash={handleMoveToTrash}
            onMoveFileItem={handleMoveFileItem}
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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

export default FileTable
