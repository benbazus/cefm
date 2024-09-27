import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getExcelFiles } from '@/services/api'

import { FileItem, FilesResponse } from '@/types/types'

import DriveTopMenu from '@/components/drive-menu'
import FileContainer from '@/components/drive/FileContainer'

export default function ExcelPage() {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const fetchAndHandleChildrenItems = useCallback(async () => {
    try {
      setLoading(true)

      const data: FilesResponse | null = await getExcelFiles()

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
      console.error('Error fetching excel files:', error)
      toast({
        title: 'Error',
        description: 'Failed to load the excel files. Please try again later.',
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
