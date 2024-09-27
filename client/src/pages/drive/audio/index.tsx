// import { useCallback, useEffect, useState } from 'react'
// import { toast } from '@/components/ui/use-toast'
// import { getAudio } from '@/services/api'
// import { FileItem } from '@/types/types'
// import DriveTopMenu from '@/components/drive-menu'
// import FileContainer from '@/components/drive/FileContainer'
// import { ErrorBoundary } from 'react-error-boundary'
// import { Loader2 } from 'lucide-react'

// export default function AudioPage() {
//   const [isLoading, setLoading] = useState(true)
//   const [fileItems, setFileItems] = useState<FileItem[]>([])

//   const fetchAndHandleChildrenItems = useCallback(async () => {
//     try {
//       setLoading(true)
//       const data = await getAudio()

//       if (data && Array.isArray(data.files)) {
//         const fetchedFiles = data.files.map((file: any) => ({
//           id: file.id,
//           name: file.name,
//           createdAt: new Date(file.createdAt),
//           updatedAt: new Date(file.updatedAt),
//           size: file.size,
//           owner: file.userId,
//           type: 'file' as const,
//           mimeType: file.mimeType || 'audio/mpeg',
//         }))

//         setFileItems(fetchedFiles)
//       } else {
//         throw new Error('Invalid data structure received from API')
//       }
//     } catch (error) {
//       console.error('Error fetching audio files:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load the audio files. Please try again later.',
//         variant: 'destructive',
//       })
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchAndHandleChildrenItems()
//   }, [fetchAndHandleChildrenItems])

//   if (isLoading) {
//     return (
//       <div className='flex h-screen items-center justify-center'>
//         <Loader2 className='h-8 w-8 animate-spin' />
//       </div>
//     )
//   }

//   return (
//     <ErrorBoundary fallback={<ErrorFallback />}>
//       <DriveTopMenu />
//       <FileContainer fileItems={fileItems} isLoading={isLoading} />
//     </ErrorBoundary>
//   )
// }

// function ErrorFallback() {
//   return (
//     <div className='flex h-screen flex-col items-center justify-center'>
//       <h2 className='mb-4 text-2xl font-bold'>Oops! Something went wrong.</h2>
//       <button
//         className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
//         onClick={() => window.location.reload()}
//       >
//         Try again
//       </button>
//     </div>
//   )
// }

// import { useCallback, useEffect, useState } from 'react'
// import { toast } from '@/components/ui/use-toast'
// import { getAudio } from '@/services/api'
// import { FileItem } from '@/types/types'

// import DriveTopMenu from '@/components/drive-menu'
// import FileContainer from '@/components/drive/FileContainer'

// export default function PhotoPage() {
//   const [isLoading, setIsLoading] = useState(false) // Renamed for clarity
//   const [fileItems, setFileItems] = useState<FileItem[]>([])

//   const fetchAndHandleAudioFiles = useCallback(async () => {
//     setIsLoading(true)
//     try {
//       const data = await getAudio()
//       if (!data || !data.files) {
//         throw new Error('No files found in response.')
//       }

//       // Safely map the data, ensuring type correctness
//       const fetchedFiles = data.files.map((file: any) => ({
//         id: file.id || '',
//         name: file.name || 'Untitled',
//         createdAt: new Date(file.createdAt || Date.now()),
//         updatedAt: new Date(file.updatedAt || Date.now()),
//         size: file.size || 0,
//         owner: file.userId || 'Unknown',
//         type: 'file' as const,
//         mimeType: file.mimeType || 'application/octet-stream',
//       }))

//       // Deduplicate files by their ID using a Map
//       const uniqueFiles = Array.from(
//         new Map(fetchedFiles.map((file) => [file.id, file])).values()
//       )

//       setFileItems(uniqueFiles) // Update the state with fetched files
//     } catch (error) {
//       console.error('Error fetching audio files:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load the audio files. Please try again later.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoading(false) // Stop loading
//     }
//   }, [])

//   useEffect(() => {
//     fetchAndHandleAudioFiles()
//   }, [fetchAndHandleAudioFiles])

//   return (
//     <>
//       <DriveTopMenu />
//       <FileContainer fileItems={fileItems} isLoading={isLoading} />
//     </>
//   )
// }

import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getAudio } from '@/services/api'
import {
  FileItem,
  FileItemResponse,
  FilesResponse,
  GetAudioResponse,
} from '@/types/types'

import DriveTopMenu from '@/components/drive-menu'
import FileContainer from '@/components/drive/FileContainer'

export default function AudioPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const fetchAndHandleAudioFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data: FilesResponse | null = await getAudio()

      if (!data || !data.files) {
        throw new Error('No files found in response.')
      }

      // Map the raw API response to the FileItem type
      const fetchedFiles: FileItem[] = data.files.map(
        (file: FileItemResponse) => ({
          id: file.id || '',
          name: file.name || 'Untitled',
          createdAt: new Date(file.createdAt || Date.now()), // Ensure Date type
          updatedAt: new Date(file.updatedAt || Date.now()), // Ensure Date type
          size: file.size || 0,
          owner: file.userId || 'Unknown', // Assuming userId maps to owner
          type: 'file', // Literal type as 'file'
          mimeType: file.mimeType || 'application/octet-stream',
        })
      )

      // Deduplicate files by their ID using a Map
      const uniqueFiles = Array.from(
        new Map(fetchedFiles.map((file) => [file.id, file])).values()
      )

      // Update the state with properly typed files
      setFileItems(uniqueFiles)
    } catch (error) {
      console.error('Error fetching audio files:', error)
      toast({
        title: 'Error',
        description: 'Failed to load the audio files. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAndHandleAudioFiles()
  }, [fetchAndHandleAudioFiles])

  return (
    <>
      <DriveTopMenu />
      <FileContainer fileItems={fileItems} isLoading={isLoading} />
    </>
  )
}

// import { useCallback, useEffect, useState } from 'react'
// import { toast } from '@/components/ui/use-toast'
// import { getAudio } from '@/services/api'
// import { FileItem, FileItemResponse, GetAudioResponse } from '@/types/types'

// import DriveTopMenu from '@/components/drive-menu'
// import FileContainer from '@/components/drive/FileContainer'

// export default function AudioPage() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [fileItems, setFileItems] = useState<FileItem[]>([])

//   const fetchAndHandleAudioFiles = useCallback(async () => {
//     setIsLoading(true)
//     try {
//       const data = (await getAudio()) as GetAudioResponse

//       if (!data || !data.files) {
//         throw new Error('No files found in response.')
//       }
//       // Deduplicate files by their ID using a Map
//       const uniqueFiles = Array.from(
//         new Map(
//           data.files
//             .map((file: FileItemResponse) => ({
//               id: file.id || '',
//               name: file.name || 'Untitled',
//               createdAt: new Date(file.createdAt || Date.now()),
//               updatedAt: new Date(file.updatedAt || Date.now()),
//               size: file.size || 0,
//               owner: file.userId || 'Unknown',
//               type: 'file' as const,
//               mimeType: file.mimeType || 'application/octet-stream',
//             }))
//             .map((file) => [file.id, file])
//         ).values()
//       )

//       setFileItems(uniqueFiles)
//     } catch (error) {
//       console.error('Error fetching audio files:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load the audio files. Please try again later.',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchAndHandleAudioFiles()
//   }, [fetchAndHandleAudioFiles])

//   return (
//     <>
//       <DriveTopMenu />
//       <FileContainer fileItems={fileItems} isLoading={isLoading} />
//     </>
//   )
// }

// import { useCallback, useEffect, useState } from 'react'
// import { toast } from '@/components/ui/use-toast'
// import { getAudio } from '@/services/api'

// import { FileItem } from '@/types/types'

// import DriveTopMenu from '@/components/drive-menu'
// import FileContainer from '@/components/drive/FileContainer'

// export default function PhotoPage() {
//   const [isLoading, setLoading] = useState(false)
//   const [fileItems, setFileItems] = useState<FileItem[]>([])

//   const fetchAndHandleChildrenItems = useCallback(async () => {
//     try {
//       setLoading(true)

//       const data = await getAudio()

//       if (data) {
//         const fetchedFiles = (data.files || []).map((file: any) => ({
//           id: file.id,
//           name: file.name,
//           createdAt: new Date(file.createdAt),
//           updatedAt: new Date(file.updatedAt),
//           size: file.size,
//           owner: file.userId,
//           type: 'file' as const,
//           mimeType: file.mimeType || 'application/octet-stream',
//         }))

//         const combinedItems = [...fetchedFiles]
//         const uniqueItems = Array.from(
//           new Map(combinedItems.map((item) => [item.id, item])).values()
//         )
//         setFileItems(uniqueItems)
//       }
//     } catch (error) {
//       console.error('Error fetching audio files:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load the audio files. Please try again later.',
//         variant: 'destructive',
//       })
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchAndHandleChildrenItems()
//   }, [fetchAndHandleChildrenItems])

//   return (
//     <>
//       <DriveTopMenu />
//       <FileContainer fileItems={fileItems} isLoading={isLoading} />
//     </>
//   )
// }
