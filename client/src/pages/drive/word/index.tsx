import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getWord } from '@/services/api'

import { FileItem, FilesResponse } from '@/types/types'

import DriveTopMenu from '@/components/drive-menu'
import FileContainer from '@/components/drive/FileContainer'

export default function PhotoPage() {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const fetchAndHandleChildrenItems = useCallback(async () => {
    try {
      setLoading(true)

      const data: FilesResponse | null = await getWord()

      if (data) {
        const fetchedFiles = (data.files || []).map((file) => ({
          id: file.id,
          name: file.name,
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt),
          size: file.size,
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
      console.error('Error fetching word documents:', error)
      toast({
        title: 'Error',
        description:
          'Failed to load the word documents Please try again later.',
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
