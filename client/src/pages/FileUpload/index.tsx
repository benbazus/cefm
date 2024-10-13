import FilePreview from '@/components/drive/FilePreview'
import { toast } from '@/components/ui/use-toast'
import { getPdf } from '@/services/api'
import { FileItem } from '@/types/types'
import React, { useCallback, useEffect, useState } from 'react'

interface File {
  id: string
  name: string
  // other file properties
}

interface FileListProps {
  files: File[]
}

export default function FileList({ files }: FileListProps) {
  const [isLoading, setLoading] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])

  const fetchAndHandleChildrenItems = useCallback(async () => {
    try {
      setLoading(true)

      const data = await getPdf()

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
    <div className='space-y-4'>
      {fileItems.map((file) => (
        <div
          key={file.id}
          className='flex items-center justify-between rounded-lg border p-4'
        >
          <span>{file.name}</span>
          <FilePreview fileId={file.id} fileName={file.name} />
        </div>
      ))}
    </div>
  )
}

// import React, { useState, useRef, useEffect } from 'react'

// interface FileObject {
//   file: File
//   element: HTMLDivElement
//   size: number
//   status: string
//   percentage: number
//   uploadedChunkSize: number
// }

// interface UploadOptions {
//   url: string
//   startingByte: number
//   fileId: string
//   onAbort: (e: ProgressEvent, file: File) => void
//   onProgress: (e: ProgressEvent & { percentage: number }, file: File) => void
//   onError: (e: ProgressEvent | Error, file: File) => void
//   onComplete: (e: ProgressEvent, file: File) => void
// }

// const ENDPOINTS = {
//   UPLOAD: 'http://localhost:1234/upload',
//   UPLOAD_STATUS: 'http://localhost:1234/upload-status',
//   UPLOAD_REQUEST: 'http://localhost:1234/upload-request',
// }

// const FILE_STATUS = {
//   PENDING: 'pending',
//   UPLOADING: 'uploading',
//   PAUSED: 'paused',
//   COMPLETED: 'completed',
//   FAILED: 'failed',
// }

// const FileUpload: React.FC = () => {
//   const [files, setFiles] = useState<Map<File, FileObject>>(new Map())
//   const progressBoxRef = useRef<HTMLDivElement>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const uploadFileChunks = (file: File, options: UploadOptions) => {
//     const formData = new FormData()
//     const req = new XMLHttpRequest()
//     const chunk = file.slice(options.startingByte)

//     formData.append('chunk', chunk, file.name)
//     formData.append('fileId', options.fileId)

//     req.open('POST', options.url, true)
//     req.setRequestHeader(
//       'Content-Range',
//       `bytes=${options.startingByte}-${options.startingByte + chunk.size}/${file.size}`
//     )
//     req.setRequestHeader('X-File-Id', options.fileId)

//     req.onload = (e) => {
//       if (req.status === 200) {
//         options.onComplete(e, file)
//       } else {
//         options.onError(e, file)
//       }
//     }

//     req.upload.onprogress = (e) => {
//       const loaded = options.startingByte + e.loaded
//       options.onProgress(
//         {
//           ...e,
//           loaded,
//           total: file.size,
//           percentage: (loaded * 100) / file.size,
//         },
//         file
//       )
//     }

//     req.ontimeout = (e) => options.onError(e, file)
//     req.onabort = (e) => options.onAbort(e, file)
//     req.onerror = (e) => options.onError(e, file)

//     req.send(formData)
//     return req
//   }

//   const uploadFile = async (file: File, options: Partial<UploadOptions>) => {
//     try {
//       const response = await fetch(ENDPOINTS.UPLOAD_REQUEST, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fileName: file.name,
//         }),
//       })
//       const data = await response.json()
//       const fullOptions = { ...options, ...data } as UploadOptions
//       setFiles((prevFiles) => {
//         const newFiles = new Map(prevFiles)
//         newFiles.set(file, { ...newFiles.get(file)!, options: fullOptions })
//         return newFiles
//       })
//       uploadFileChunks(file, fullOptions)
//     } catch (e) {
//       options.onError?.(e as Error, file)
//     }
//   }

//   const abortFileUpload = (file: File) => {
//     const fileObj = files.get(file)
//     if (fileObj && fileObj.request) {
//       fileObj.request.abort()
//       return true
//     }
//     return false
//   }

//   const retryFileUpload = async (file: File) => {
//     const fileObj = files.get(file)
//     if (fileObj) {
//       try {
//         const response = await fetch(
//           `${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileObj.options.fileId}`
//         )
//         const data = await response.json()
//         uploadFileChunks(file, {
//           ...fileObj.options,
//           startingByte: Number(data.totalChunkUploaded),
//         })
//       } catch {
//         uploadFileChunks(file, fileObj.options)
//       }
//     }
//   }

//   const clearFileUpload = async (file: File) => {
//     const fileObj = files.get(file)
//     if (fileObj) {
//       await abortFileUpload(file)
//       setFiles((prevFiles) => {
//         const newFiles = new Map(prevFiles)
//         newFiles.delete(file)
//         return newFiles
//       })
//       return true
//     }
//     return false
//   }

//   const resumeFileUpload = async (file: File) => {
//     const fileObj = files.get(file)
//     if (fileObj) {
//       try {
//         const response = await fetch(
//           `${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileObj.options.fileId}`
//         )
//         const data = await response.json()
//         uploadFileChunks(file, {
//           ...fileObj.options,
//           startingByte: Number(data.totalChunkUploaded),
//         })
//       } catch (e) {
//         fileObj.options.onError(e as Error, file)
//       }
//     }
//   }

//   const updateFileElement = (fileObject: FileObject) => {
//     // Update file element UI
//   }

//   const setFileElement = (file: File) => {
//     const extIndex = file.name.lastIndexOf('.')
//     const fileElement = document.createElement('div')
//     fileElement.className = 'file-progress'
//     fileElement.innerHTML = `
//       <div class="file-details" style="position: relative">
//         <p>
//           <span class="status">pending</span>
//           <span class="file-name">${file.name.substring(0, extIndex)}</span>
//           <span class="file-ext">${file.name.substring(extIndex)}</span>
//         </p>
//         <div class="progress-bar" style="width: 0;"></div>
//       </div>
//       <div class="file-actions">
//         <button type="button" class="retry-btn" style="display: none">Retry</button>
//         <button type="button" class="cancel-btn" style="display: none">Pause</button>
//         <button type="button" class="resume-btn" style="display: none">Resume</button>
//         <button type="button" class="clear-btn" style="display: none">Clear</button>
//       </div>
//     `
//     setFiles((prevFiles) => {
//       const newFiles = new Map(prevFiles)
//       newFiles.set(file, {
//         file,
//         element: fileElement,
//         size: file.size,
//         status: FILE_STATUS.PENDING,
//         percentage: 0,
//         uploadedChunkSize: 0,
//       })
//       return newFiles
//     })

//     const [
//       _,
//       {
//         children: [retryBtn, pauseBtn, resumeBtn, clearBtn],
//       },
//     ] = fileElement.children

//     clearBtn.addEventListener('click', () => clearFileUpload(file))
//     retryBtn.addEventListener('click', () => retryFileUpload(file))
//     pauseBtn.addEventListener('click', () => abortFileUpload(file))
//     resumeBtn.addEventListener('click', () => resumeFileUpload(file))

//     progressBoxRef.current
//       ?.querySelector('.file-progress-wrapper')
//       ?.appendChild(fileElement)
//   }

//   const onComplete = (e: ProgressEvent, file: File) => {
//     setFiles((prevFiles) => {
//       const newFiles = new Map(prevFiles)
//       const fileObj = newFiles.get(file)!
//       fileObj.status = FILE_STATUS.COMPLETED
//       fileObj.percentage = 100
//       return newFiles
//     })
//   }

//   const onProgress = (
//     e: ProgressEvent & { percentage: number },
//     file: File
//   ) => {
//     setFiles((prevFiles) => {
//       const newFiles = new Map(prevFiles)
//       const fileObj = newFiles.get(file)!
//       fileObj.status = FILE_STATUS.UPLOADING
//       fileObj.percentage = e.percentage
//       fileObj.uploadedChunkSize = e.loaded
//       return newFiles
//     })
//   }

//   const onError = (e: ProgressEvent | Error, file: File) => {
//     setFiles((prevFiles) => {
//       const newFiles = new Map(prevFiles)
//       const fileObj = newFiles.get(file)!
//       fileObj.status = FILE_STATUS.FAILED
//       fileObj.percentage = 100
//       return newFiles
//     })
//   }

//   const onAbort = (e: ProgressEvent, file: File) => {
//     setFiles((prevFiles) => {
//       const newFiles = new Map(prevFiles)
//       const fileObj = newFiles.get(file)!
//       fileObj.status = FILE_STATUS.PAUSED
//       return newFiles
//     })
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       Array.from(e.target.files).forEach(setFileElement)
//       Array.from(e.target.files).forEach((file) => {
//         uploadFile(file, {
//           onProgress,
//           onError,
//           onAbort,
//           onComplete,
//         })
//       })
//       e.target.value = ''
//     }
//   }

//   useEffect(() => {
//     files.forEach(updateFileElement)
//   }, [files])

//   return (
//     <div>
//       <input
//         type='file'
//         id='file-upload-input'
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         multiple
//       />
//       <div ref={progressBoxRef} className='upload-progress-tracker'>
//         <h3>Uploading {files.size} Files</h3>
//         <p className='upload-progress'>
//           <span className='uploads-percentage'>0%</span>
//           <span className='success-count'>0</span>
//           <span className='failed-count'>0</span>
//           <span className='paused-count'>0</span>
//         </p>
//         <button type='button' className='maximize-btn'>
//           Maximize
//         </button>
//         <div className='uploads-progress-bar' style={{ width: 0 }}></div>
//         <div className='file-progress-wrapper'></div>
//       </div>
//     </div>
//   )
// }

// export default FileUpload
