import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

import { FileText, Copy, ExternalLink } from 'lucide-react'
import { copyToClipboard } from '@/utils/helpers'
import { getSharedLink } from '@/services/api'

interface FilePreviewProps {
  fileId: string
  fileName: string
}

export default function FilePreview({ fileId, fileName }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [fileLink, setFileLink] = useState('')

  const { toast } = useToast()

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  const handleCopyLink = async () => {
    try {
      const sharedLinkData = await getSharedLink(fileId)
      if (!sharedLinkData || !sharedLinkData.link)
        throw new Error('No link found')

      //
      const success = await copyToClipboard(sharedLinkData.link)
      if (success) {
        setFileLink(sharedLinkData.link)
        toast({
          title: 'Link copied',
          description: 'File link has been copied to clipboard',
        })
      } else {
        throw new Error('Failed to copy link')
      }
    } catch (error) {
      console.error('Error copying link:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy file link',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='flex items-center space-x-2'>
      <Button onClick={handlePreview} variant='outline'>
        <FileText className='mr-2 h-4 w-4' />
        Preview
      </Button>
      <Button onClick={handleCopyLink} variant='outline'>
        <Copy className='mr-2 h-4 w-4' />
        Copy Link
      </Button>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>{fileName}</DialogTitle>
          </DialogHeader>

          <div className='aspect-video'>
            <iframe
              src={`/api/files/preview/${fileId}`}
              className='h-full w-full border-0'
              title={`Preview of ${fileName}`}
            />
          </div>

          {fileLink && (
            <div className='mt-4 flex items-center justify-between rounded-md border p-2'>
              <span className='truncate text-sm'>{fileLink}</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => window.open(fileLink, '_blank')}
              >
                <ExternalLink className='h-4 w-4' />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
