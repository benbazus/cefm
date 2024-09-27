import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, FileText } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/custom/button'
import { checkPassword, downloadItem, getSharedItems } from '@/services/api'

interface SharedFileProps {
  fileId: string
}

interface FileData {
  name: string
  size: number
  mimeType: string
  itemId: string
  isPasswordEnabled: boolean
  previewUrl: string
}

export default function SharedFile({ fileId }: SharedFileProps) {
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [password, setPassword] = useState('')
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileExist, setFileExist] = useState<boolean>(true)
  const navigate = useNavigate()
  const { toast } = useToast()
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const [isFolder, setIsFolder] = useState(false)
  const location = useLocation()
  const encodedId = location.pathname.split('/')[2]

  useEffect(() => {
    const loadFile = async () => {
      if (!fileId) {
        setFileExist(false)
        return
      }

      try {
        setLoading(true)
        const data = await getSharedItems(fileId)

        if (data.shareableType && data.shareableType === 'Folder') {
          setIsFolder(true)
        }

        setFileData(data)
        setPasswordProtected(data.isPasswordEnabled)
      } catch (error) {
        setFileExist(false)
        console.error('Error loading file data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load file data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadFile()
  }, [fileId, toast])

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fileData) return

    try {
      setLoading(true)
      const data = await checkPassword(password, encodedId)
      if (data) {
        setPasswordProtected(false)
        toast({
          title: 'Success',
          description: 'Password check successful',
        })
      }
    } catch (error) {
      console.error('Error validating password:', error)
      toast({
        title: 'Error',
        description: 'Invalid password',
        variant: 'destructive',
      })
      setPassword('')
      passwordInputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (size: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024
      i++
    }
    return `${size?.toFixed(2)} ${units[i]}`
  }

  const handleDownload = async () => {
    if (!fileData) return

    try {
      setLoading(true)
      const isFile = fileData.name.includes('.')

      await downloadItem(isFile, fileData.itemId, fileData?.name)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const Header = () => (
    <header className='bg-primary p-4 text-primary-foreground'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='truncate text-2xl font-bold'>
            {fileData?.name}
            {isFolder && '.zip'}
          </h1>
          <span className='text-sm'>
            {!isFolder && fileData && formatFileSize(fileData.size)}
          </span>
        </div>
      </div>
    </header>
  )

  const FilePreview = () => (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='text-center'>
        <FileText className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
        <h2 className='mb-4 text-xl font-bold'>
          Preview for this file type is not supported
        </h2>
        <Button onClick={handleDownload} disabled={loading}>
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </div>
  )

  const NotFoundPage = () => (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full max-w-md rounded-lg bg-card p-6 text-center shadow-lg'>
        <AlertCircle className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
        <h2 className='mb-4 text-2xl font-bold'>
          Hm, we could not find that one
        </h2>
        <p className='mb-6'>
          This file may have been deleted, moved, or made unavailable. Try
          reaching out to the file owner.
        </p>
        <Button onClick={() => navigate('/drive/home')} className='w-full'>
          Back to Homepage
        </Button>
      </div>
    </div>
  )

  const PasswordPage = () => (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full max-w-md rounded-lg bg-card p-6 text-center shadow-lg'>
        <AlertCircle className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
        <h2 className='mb-4 text-2xl font-bold'>Enter Password</h2>
        <p className='mb-6'>
          This file is password protected. Please enter the password to access
          it.
        </p>
        <form
          className='flex flex-col space-y-4'
          onSubmit={handlePasswordSubmit}
        >
          <Input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label='Password'
            ref={passwordInputRef}
          />
          <Button type='submit' disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )

  if (!fileExist) {
    return <NotFoundPage />
  }

  if (passwordProtected) {
    return <PasswordPage />
  }

  return (
    <>
      <Header />
      <FilePreview />
    </>
  )
}
