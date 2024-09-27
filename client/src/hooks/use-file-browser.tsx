import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useFolder } from '@/contexts/FolderContext'
import { createNewFolder, filesUploadToServer } from '@/services/api'
import { useFolderFile } from '@/contexts/FileFolderContext'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

export function useFileBrowser() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { triggerRefresh } = useFolderFile()
  const { folderId } = useFolder()
  const navigate = useNavigate()
  const createFolder = useCallback(
    async (name: string) => {
      setLoading(true)
      try {
        await createNewFolder(name, folderId)

        // setFiles((prev: ViewState) => [...prev, newFolder])

        toast({
          title: 'Folder created',
          description: `Folder has been created successfully.`,
        })
        triggerRefresh()
      } catch (error) {
        console.error('Create folder error:', error)
        toast({
          title: 'Error',
          description: 'Failed to create folder. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [folderId, toast, triggerRefresh]
  )

  const uploadFile = useCallback(
    async (file: File, onProgress: (progress: number) => void) => {
      setLoading(true)
      try {
        const uploadedFile = await filesUploadToServer(
          file,
          folderId,
          onProgress
        )
        setFiles((prev) => [...prev, uploadedFile])
        toast({
          title: 'File uploaded',
          description: `File "${uploadedFile.name}" has been uploaded successfully.`,
        })
        triggerRefresh()
      } catch (error) {
        console.error('File upload error:', error)
        toast({
          title: 'Error',
          description: 'Failed to upload file. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [folderId, toast, triggerRefresh]
  )

  const uploadFolder = useCallback(
    async (files: FileList, onProgress: (progress: number) => void) => {
      let totalSize = 0
      let uploadedSize = 0

      for (let i = 0; i < files.length; i++) {
        totalSize += files[i].size
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // const relativePath = file.webkitRelativePath

        await uploadFile(file as unknown as File, (fileProgress) => {
          uploadedSize += (file.size * fileProgress) / 100
          const totalProgress = (uploadedSize / totalSize) * 100
          onProgress(totalProgress)
        })
      }

      toast({
        title: 'Folder uploaded',
        description: 'Folder has been uploaded successfully.',
      })
      // triggerUpdate()
    },
    [uploadFile, toast]
  )

  const createDocument = useCallback(
    async (name: string) => {
      setLoading(true)
      try {
        const id = uuidv4()
        navigate(`/document/${id}/${name}`)
      } catch (error) {
        console.error('Create document error:', error)
        toast({
          title: 'Error',
          description: 'Failed to create document. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [navigate, toast]
  )

  return {
    files,
    loading,
    createFolder,
    uploadFile,
    uploadFolder,
    createDocument,
  }
}
