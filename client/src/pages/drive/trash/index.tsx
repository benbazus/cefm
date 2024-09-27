import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getTrashed } from '@/services/api'

import { FileItem } from '@/types/types'

import DriveTopMenu from '@/components/drive-menu'
import FileContainer from '@/components/drive/FileContainer'

export default function TrashedPage() {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const fetchAndHandleChildrenItems = useCallback(async () => {
    try {
      setLoading(true)

      const data = await getTrashed()

      if (data) {
        const fetchedFiles = (data.files || []).map((file: any) => ({
          id: file.id,
          name: file.name,
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt),
          size: file.size,
          owner: file.userId,
          type: 'file' as const,
          mimeType: file.mimeType || 'application/octet-stream',
        }))

        const fetchedFolders = (data.folders || []).map((folder: any) => ({
          id: folder.id,
          name: folder.name,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
          size: folder.size,
          owner: folder.userId,
          type: 'folder' as const,
          mimeType: 'folder',
        }))

        const fetchedDocuments = (data.documents || []).map((doc: any) => ({
          id: doc.id,
          name: doc.title,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          size: doc.size,
          owner: doc.userId,
          type: 'file' as const,
          mimeType: 'file',
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
  }, [])

  useEffect(() => {
    fetchAndHandleChildrenItems()
  }, [fetchAndHandleChildrenItems])

  return (
    <>
      <DriveTopMenu />

      <FileContainer fileItems={fileItems} isLoading={isLoading} />
    </>
  )
}
