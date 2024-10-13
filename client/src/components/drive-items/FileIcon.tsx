import React from 'react'
import { FileItem } from '@/types/types'
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
import { IconFileText, IconFileZip } from '@tabler/icons-react'

interface FileIconProps {
  file: FileItem
}

const FileIcon: React.FC<FileIconProps> = ({ file }) => {
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
}

export default FileIcon
