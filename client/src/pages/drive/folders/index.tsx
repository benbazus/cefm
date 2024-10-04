import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getChildrenFoldersByParentFolderId } from '@/services/api'
import { FileItem, GetFoldersResponse } from '@/types/types'
import { useParams } from 'react-router-dom'
import { decodeFolder } from '@/utils/helpers'
import DriveTopMenu from '@/components/drive-menu'
import FileContainer from '@/components/drive/FileContainer'
import { useFolderFile } from '@/contexts/FileFolderContext'
import { useFolder } from '@/contexts/FolderContext'

import { BreadCrumb } from '@/components/custom/Bread-crumb'
import { ChevronRight, Home } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function FolderPage() {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])
  const { folderId } = useParams()
  const { refresh } = useFolderFile()
  const { setFolderId } = useFolder()

  const fetchAndHandleChildrenItems = useCallback(async () => {
    try {
      setLoading(true)
      const parentId = decodeFolder(folderId as string)
      setFolderId(parentId)

      // const [rootFolders] = await Promise.all([
      //   getChildrenFoldersByParentFolderId(parentId),
      // ])

      const rootFolders: GetFoldersResponse | null =
        await getChildrenFoldersByParentFolderId(parentId)

      if (rootFolders) {
        const fetchedFiles = (rootFolders.files || []).map((file) => ({
          id: file.id,
          name: file.name,
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt),
          size: file.size,
          owner: file.userId,
          type: 'file' as const,
          mimeType: file.mimeType || 'application/octet-stream',
        }))

        const fetchedFolders = (rootFolders.folders || []).map((folder) => ({
          id: folder.id,
          name: folder.name,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
          size: folder.size,
          owner: folder.userId,
          type: 'folder' as const,
          mimeType: 'folder',
        }))
        const combinedItems = [...fetchedFiles, ...fetchedFolders]
        const uniqueItems = Array.from(
          new Map(combinedItems.map((item) => [item.id, item])).values()
        )

        setFileItems(uniqueItems as FileItem[])
        // setFolderPath(path)
      }
    } catch (error) {
      console.error('Error fetching children folder:', error)
      toast({
        title: 'Error',
        description:
          'Failed to load the children folder. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [folderId, setFolderId])

  useEffect(() => {
    fetchAndHandleChildrenItems()
  }, [fetchAndHandleChildrenItems, refresh])

  return (
    <>
      <Card className='hidden rounded-lg border px-4 shadow-sm'>
        <BreadCrumb
          className='my-2 flex items-center'
          homeIcon={<Home className='h-4 w-4' />}
          separator={<ChevronRight className='h-4 w-4' />}
        />
      </Card>

      {/* <Breadcrumb>
        <BreadcrumbItem>
          <Link to='/drive/home'>Home</Link>
        </BreadcrumbItem>
        {folderPath.map((folder, index) => (
          <BreadcrumbItem key={folder.id}>
            <Link to={`/drive/folders/${encodeFolderId(folder.name)}11`}>
              {folder.name}
            </Link>
          </BreadcrumbItem>
        ))}
      </Breadcrumb> */}

      <DriveTopMenu />
      <FileContainer fileItems={fileItems} isLoading={isLoading} />
    </>
  )
}
