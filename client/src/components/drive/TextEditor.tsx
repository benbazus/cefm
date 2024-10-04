import { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io, Socket } from 'socket.io-client'
import { useParams } from 'react-router-dom'

import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Share2 } from 'lucide-react'
import { Button } from '../custom/button'
import ShareSettings from './dialog/ShareSettingsDialog'
import { Delta, Op } from 'quill/core'

// Constants
const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ font: [] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
]

interface TextEditorProps {
  documentPermission: string
  decodedDocumentId: string
  documentAction: string
}

export default function TextEditor({
  documentPermission,
  decodedDocumentId,
  documentAction,
}: TextEditorProps) {
  const { id } = useParams<{ id: string }>()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [quill, setQuill] = useState<Quill | null>(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentId] = useState(decodedDocumentId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  //  const [userPermission, setUserPermission] = useState<'WRITE' | 'READ'>('READ')

  const [sharedDoc] = useState<{
    email: string
    message: string
    date: string
    password: string
    permission: 'SHARE' | 'WRITE' | 'READ'
    link: string
  } | null>(null)

  console.log(' +++++++++++useEuserPermiBBBBBBssionffect++++++++++++++ ')
  console.log(documentPermission)
  console.log(' ++++++++++++useuserPermBBBBBBBBBBissionEffect+++++++++++++ ')

  useEffect(() => {
    const socketConnection = io('http://localhost:5000')
    setSocket(socketConnection)

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket || !quill || !documentId) return

    socket.once('load-document', ({ data, title }) => {
      quill.setContents(data)
      setDocumentTitle(title)

      // console.log(' +++++++++++useEuserPermissionffect++++++++++++++ ')
      // console.log(documentPermission)
      // console.log(decodedDocumentId)
      // console.log(documentAction)
      // console.log(permission)
      // console.log(' ++++++++++++useuserPermissionEffect+++++++++++++ ')

      if (documentAction === 'new' && documentPermission === 'WRITE') {
        quill.enable()
      }

      if (documentAction === 'new' || documentAction === 'edit') {
        if (documentPermission === 'WRITE') {
          quill.enable()
        } else {
          quill.disable()
        }
      } else {
        quill.disable()
      }
    })

    const userId = localStorage.getItem('userId')
    socket.emit('get-document', { documentId, userId })
  }, [
    socket,
    quill,
    id,
    documentId,
    documentAction,
    documentPermission,
    decodedDocumentId,
  ])

  useEffect(() => {
    if (!socket || !quill) return

    const intervalId = setInterval(() => {
      if (
        documentAction === 'new' ||
        (documentAction === 'edit' && documentPermission === 'WRITE')
      ) {
        socket.emit('save-document', {
          data: quill.getContents(),
          title: documentTitle,
        })
      }
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [socket, quill, documentTitle, documentAction, documentPermission])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta: Delta | Op[]) => {
      quill.updateContents(delta)
    }
    socket.on('receive-changes', handler)

    return () => {
      socket.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (delta: any, oldDelta: any, source: string) => {
      if (source !== 'user') return
      socket.emit('send-changes', delta)
    }
    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  const wrapperRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (!wrapper) return

    wrapper.innerHTML = ''
    const editor = document.createElement('div')
    wrapper.append(editor)
    const quillInstance = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        history: {
          delay: 2000,
          maxStack: 500,
          userOnly: true,
        },
      },
    })
    quillInstance.disable()
    quillInstance.setText('Loading...')
    setQuill(quillInstance)
  }, [])

  return (
    <div className='flex h-screen flex-col bg-[#f3f3f3]'>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          background-color: #f3f3f3;
          margin: 0;
        }

        .container .ql-editor {
          width: 8.5in;
          min-height: 11in;
          padding: 1in;
          margin: 1rem;
          box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
          background-color: white;
        }

        .container .ql-container.ql-snow {
          border: none;
          display: flex;
          justify-content: center;
        }

        .container .ql-toolbar.ql-snow {
          display: flex;
          justify-content: center;
          position: sticky;
          top: 0;
          z-index: 1;
          background-color: #f3f3f3;
          border: none;
          box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
        }

        @page {
          margin: 1in;
        }

        @media print {
          body {
            background: none;
          }

          .container .ql-editor {
            width: 6.5in;
            height: 9in;
            padding: 0;
            margin: 0;
            box-shadow: none;
            align-self: flex-start;
          }

          .container .ql-toolbar.ql-snow {
            display: none;
          }
        }
      `}</style>
      <header className='border-b border-gray-200 bg-white px-4 py-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <svg
              width='32'
              height='32'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M12 2L2 7V17L12 22L22 17V7L12 2Z'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M12 2V22'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M22 7L12 12'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M2 7L12 12'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <div className='flex flex-col'>
              <Input
                type='text'
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className='border-none text-lg font-medium leading-tight text-gray-900 focus:outline-none focus:ring-0'
                disabled={documentAction !== 'new' && documentAction !== 'edit'}
              />
              <div className='hidden space-x-2 text-sm text-gray-500'>
                <button className='rounded px-2 py-1 hover:bg-gray-100'>
                  File
                </button>
                <button className='rounded px-2 py-1 hover:bg-gray-100'>
                  Edit
                </button>
                <button className='rounded px-2 py-1 hover:bg-gray-100'>
                  View
                </button>
                <button className='rounded px-2 py-1 hover:bg-gray-100'>
                  Insert
                </button>
                <button className='rounded px-2 py-1 hover:bg-gray-100'>
                  Format
                </button>
                <button className='rounded px-2 py-1 hover:bg-gray-100'>
                  Tools
                </button>
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Share2 className='mr-2 h-4 w-4' />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-[600px]'>
                <DialogHeader>
                  <DialogTitle>Share Document Link</DialogTitle>
                </DialogHeader>
                <ShareSettings documentId={documentId} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <div className='container flex-1 overflow-hidden pt-4'>
        <div ref={wrapperRef} className='h-full'></div>
      </div>
      {sharedDoc && (
        <div className='fixed bottom-4 right-4 max-w-sm rounded-lg bg-white p-4 shadow-lg'>
          <h2 className='mb-2 text-lg font-semibold'>
            Shared Document Details
          </h2>
          <p>
            <strong>Email:</strong> {sharedDoc.email}
          </p>
          <p>
            <strong>Message:</strong> {sharedDoc.message}
          </p>
          <p>
            <strong>Expiry Date:</strong> {sharedDoc.date}
          </p>
          <p>
            <strong>Password:</strong> {sharedDoc.password ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Permission:</strong> {sharedDoc.permission}
          </p>
          <p>
            <strong>Link:</strong> {sharedDoc.link}
          </p>
        </div>
      )}
    </div>
  )
}
