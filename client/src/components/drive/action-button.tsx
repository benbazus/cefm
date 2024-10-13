import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FolderPlus, FileUp, FolderUp, FileText, Plus } from 'lucide-react'
import { Button } from '../custom/button'
import { v4 as uuidv4 } from 'uuid'
import { encodeFolderId } from '@/utils/helpers'

interface NewActionMenuProps {
  onCreateFolder: () => void
  onUploadFile: () => void
  onUploadFolder: () => void
  onCreateDocument: () => void
}

export function NewActionMenu({
  onCreateFolder,
  onUploadFile,
  onUploadFolder,
  onCreateDocument,
}: NewActionMenuProps) {
  const onCreateNewDocument = () => {
    const id = encodeFolderId(uuidv4())
    const url = `/document/e/${id}/new`
    window.open(url, '_blank')
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className='w-48'>
          <Plus className='mr-4 h-6 w-8' />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onCreateFolder}>
          <FolderPlus className='mr-2 h-4 w-4' />
          New Folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadFile}>
          <FileUp className='mr-2 h-4 w-4' />
          Upload File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadFolder} className='hidden'>
          <FolderUp className='mr-2 h-4 w-4' />
          Upload Folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateDocument} className='hidden'>
          <FileText className='mr-2 h-4 w-4' />
          New Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateNewDocument}>
          <FileText className='mr-2 h-4 w-4' />
          New Document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
