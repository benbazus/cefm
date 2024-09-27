import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getCustomDocuments } from '@/services/api'

import { FileItem } from '@/types/types'

import DriveTopMenu from '@/components/drive-menu'
import FileContainer from '@/components/drive/FileContainer'

export default function CustomDocumentPage() {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const fetchAndHandleChildrenItems = useCallback(async () => {
    try {
      setLoading(true)

      const data = await getCustomDocuments()

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchedFiles = (data.documents || []).map((file: any) => ({
          id: file.id,
          name: file.title,
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt),
          size: file.size || 0,
          owner: file.userId,
          type: 'file' as const,
          mimeType: file.mimeType || 'application/octet-stream',
        }))

        const combinedItems = [...fetchedFiles]
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
