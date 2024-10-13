import { useEffect, useState, useCallback } from 'react'
import { getRootChildren, getRootFolder } from '@/services/api'
import { toast } from '@/components/ui/use-toast'
import { DriveItemsResponse, FileItem } from '@/types/types'
import DriveContainer from '@/components/drive/DriveContainer'
import DriveTopMenu from '@/components/drive-menu'
import { useFolderFile } from '@/contexts/FileFolderContext'
import { useFolder } from '@/contexts/FolderContext'
import { BreadCrumb } from '@/components/custom/Bread-crumb'
import { ChevronRight, Home } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function HomePage() {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])
  const { setFolderId, setFolderName } = useFolder()
  const { refresh } = useFolderFile()

  const fetchAndHandleRootFolder = useCallback(async () => {
    try {
      setLoading(true)

      const rootFolder = (await getRootFolder()) as FileItem
      if (rootFolder) {
        setFolderId(rootFolder?.id)
        setFolderName(rootFolder?.name)
      }

      const rootFolders: DriveItemsResponse = await getRootChildren()
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
          size: folder.totalSize,
          owner: folder.userId,
          type: 'folder' as const,
          mimeType: 'folder',
        }))

        const fetchedDocuments = (rootFolders.documents || []).map((file) => ({
          id: file.id,
          name: file.title,
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt),
          size: file.size,
          owner: file.userId,
          type: 'file' as const,
          mimeType: file.mimeType || 'application/octet-stream',
        }))

        const combinedItems = [
          ...fetchedFiles,
          ...fetchedFolders,
          ...fetchedDocuments,
        ]
        const uniqueItems = Array.from(
          new Map(combinedItems.map((item) => [item.id, item])).values()
        )
        setFileItems(uniqueItems)
      }
    } catch (error) {
      console.error('Error fetching root folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to load the folder. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [setFolderId, setFolderName])

  useEffect(() => {
    fetchAndHandleRootFolder()
  }, [fetchAndHandleRootFolder, refresh])

  return (
    <>
      <Card className='hidden rounded-lg border px-4 shadow-sm'>
        <BreadCrumb
          className='my-2 flex items-center'
          homeIcon={<Home className='h-4 w-4' />}
          separator={<ChevronRight className='h-4 w-4' />}
        />
      </Card>

      {/* <div className='container mx-auto px-4'>
        <BreadCrumb
          className='my-4'
          homeIcon={<Home className='h-4 w-4' />}
          separator={<ChevronRight className='h-4 w-4' />}
        />
      </div> */}

      {/* <Breadcrumb>
        <BreadcrumbItem>
          <Link to='/drive/home'>Home</Link>
        </BreadcrumbItem>
      </Breadcrumb> */}

      <DriveTopMenu />
      <DriveContainer fileItems={fileItems} isLoading={isLoading} />
    </>
  )
}
