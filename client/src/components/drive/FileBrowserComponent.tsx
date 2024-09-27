import { useState, useRef, useEffect } from 'react'

import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Minimize2,
  X,
  Pause,
  Play,
  Trash2,
  XCircle,
  RotateCcw,
} from 'lucide-react'

import { Button } from '../custom/button'

import { ScrollArea } from '../ui/scroll-area'
import { Progress } from '../ui/progress'

import { NewActionMenu } from './action-button'
import { useFileBrowser } from '@/hooks/use-file-browser'
import { formatFileSize } from '@/utils/helpers'

interface Transfer {
  id: string
  name: string
  progress: number
  size: string
  status: 'uploading' | 'paused' | 'completed' | 'failed'
  file: File
}

export function FileBrowserComponent() {
  const [folderName, setFolderName] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    files,
    loading,
    createFolder,
    uploadFile: uploadFileToServer,

    createDocument,
  } = useFileBrowser()

  const handleCreateFolder = () => {
    createFolder(folderName)
    setFolderName('')
    setIsCreateFolderOpen(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newTransfers: Transfer[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        progress: 0,
        size: formatFileSize(file.size),
        status: 'uploading',
        file: file,
      }))
      setTransfers((prev) => [...prev, ...newTransfers])
      setShowManager(true)
      newTransfers.forEach((transfer) => uploadFile(transfer))
    }
  }
  const uploadFile = async (transfer: Transfer) => {
    const formData = new FormData()
    formData.append('file', transfer.file)

    try {
      // Ensure the server function works with native File object
      await uploadFileToServer(transfer.file, (progress) => {
        setTransfers((prev) =>
          prev.map((t) => {
            if (t.id === transfer.id) {
              return {
                ...t,
                progress,
                status: progress === 100 ? 'completed' : 'uploading',
              }
            }
            return t
          })
        )
      })
    } catch (error) {
      console.error('Upload error:', error)
      setTransfers((prev) =>
        prev.map((t) => (t.id === transfer.id ? { ...t, status: 'failed' } : t))
      )
    }
  }
  const handleCreateDocument = () => {
    // const id = uuidv4()
    // navigate(`/document/${id}`)

    createDocument(documentName)
    setIsCreateDocumentOpen(false)
  }

  const removeTransfer = (id: string) => {
    setTransfers(transfers.filter((t) => t.id !== id))
  }

  const pauseTransfer = (id: string) => {
    setTransfers(
      transfers.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'paused' ? 'uploading' : 'paused' }
          : t
      )
    )
  }

  const pauseAllTransfers = () => {
    setTransfers(
      transfers.map((t) =>
        t.status === 'uploading' ? { ...t, status: 'paused' } : t
      )
    )
  }

  // const resumeAllTransfers = () => {
  //   setTransfers(
  //     transfers.map((t) =>
  //       t.status === 'paused' ? { ...t, status: 'uploading' } : t
  //     )
  //   )
  // }

  const cancelAllTransfers = () => {
    setTransfers(
      transfers.map((t) =>
        t.status === 'uploading' || t.status === 'paused'
          ? { ...t, status: 'failed' }
          : t
      )
    )
  }

  const retryFailedTransfers = () => {
    setTransfers(
      transfers.map((t) =>
        t.status === 'failed' ? { ...t, status: 'uploading', progress: 0 } : t
      )
    )
    transfers.filter((t) => t.status === 'failed').forEach(uploadFile)
  }

  const activeTransfers = transfers.filter(
    (t) => t.status === 'uploading' || t.status === 'paused'
  ).length
  const completedTransfers = transfers.filter(
    (t) => t.status === 'completed'
  ).length

  const filteredTransfers = transfers.filter((t) => {
    switch (activeTab) {
      case 'active':
        return t.status === 'uploading' || t.status === 'paused'
      case 'completed':
        return t.status === 'completed'
      case 'failed':
        return t.status === 'failed'
      default:
        return true
    }
  })

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (transfers.some((t) => t.status === 'uploading')) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [transfers])

  return (
    <div className='space-y-4'>
      <NewActionMenu
        onCreateFolder={() => setIsCreateFolderOpen(true)}
        onUploadFile={() => fileInputRef.current?.click()}
        onUploadFolder={() => folderInputRef.current?.click()}
        onCreateDocument={() => setIsCreateDocumentOpen(true)}
      />

      <input
        ref={fileInputRef}
        type='file'
        onChange={handleFileSelect}
        multiple
        className='hidden'
      />

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder </DialogTitle>
          </DialogHeader>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder='Folder name'
          />
          <DialogFooter>
            <Button
              onClick={handleCreateFolder}
              disabled={loading || !folderName}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDocumentOpen}
        onOpenChange={setIsCreateDocumentOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document </DialogTitle>
          </DialogHeader>
          <Input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder='Document name'
          />
          <DialogFooter>
            <Button
              onClick={handleCreateDocument}
              disabled={loading || !documentName}
            >
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showManager && (
        <div className='fixed bottom-4 right-4 w-96 rounded-lg border bg-background shadow-lg'>
          <div className='flex items-center justify-between bg-secondary p-2'>
            <div className='text-sm font-medium'>
              {activeTransfers} uploading({completedTransfers} completed)
            </div>
            <div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowManager(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
              >
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='all'> All </TabsTrigger>
                  <TabsTrigger value='active'> Active </TabsTrigger>
                  <TabsTrigger value='completed'> Completed </TabsTrigger>
                  <TabsTrigger value='failed'> Failed </TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                  <ScrollArea className='h-64 w-full rounded-md border'>
                    {filteredTransfers.map((transfer) => (
                      <TransferItem
                        key={transfer.id}
                        transfer={transfer}
                        onRemove={removeTransfer}
                        onPause={pauseTransfer}
                      />
                    ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              <div className='flex justify-end space-x-2 bg-secondary p-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={pauseAllTransfers}
                >
                  <Pause className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={cancelAllTransfers}
                >
                  <XCircle className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={retryFailedTransfers}
                >
                  <RotateCcw className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TransferItem({
  transfer,
  onRemove,
  onPause,
}: {
  transfer: Transfer
  onRemove: (id: string) => void
  onPause: (id: string) => void
}) {
  return (
    <div className='border-b p-4 last:border-b-0'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-medium'> {transfer.name} </span>
        <span className='text-sm text-muted-foreground'> {transfer.size} </span>
      </div>
      <div className='flex items-center justify-between'>
        <Progress value={transfer.progress} className='w-3/4' />
        <div className='flex space-x-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onPause(transfer.id)}
          >
            {transfer.status === 'paused' ? (
              <Play className='h-4 w-4' />
            ) : (
              <Pause className='h-4 w-4' />
            )}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onRemove(transfer.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
