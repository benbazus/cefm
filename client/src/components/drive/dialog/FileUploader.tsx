import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/custom/button'
import { FileWithProgress } from '@/types/types'
import { uploadFiles } from '@/services/api'
 

export function FileUploader() {
  const [files, setFiles] = useState<FileWithProgress[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map((file) => Object.assign(file, { progress: 0 })))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const updateProgress = (updatedFile: FileWithProgress, progress: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === updatedFile.name &&
        file.lastModified === updatedFile.lastModified
          ? { ...file, progress }
          : file
      )
    )
  }

  const handleUploadFiles = async () => {
    try {
      await uploadFiles(files, updateProgress)
      console.log('All files uploaded successfully')
    } catch (error) {
      console.error('Error uploading files:', error)
    }
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className='cursor-pointer border-2 border-dashed border-gray-300 p-4 text-center'
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {files.length > 0 && (
        <div className='mt-4'>
          {files.map((file) => (
            <div key={`${file.name}-${file.lastModified}`} className='mb-2'>
              <p>{file.name}</p>
              <Progress value={file.progress} className='w-full' />
            </div>
          ))}
          <Button onClick={handleUploadFiles} className='mt-4'>
            Upload Files
          </Button>
        </div>
      )}
    </div>
  )
}
