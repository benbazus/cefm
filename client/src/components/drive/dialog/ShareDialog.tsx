import { Button } from '@/components/custom/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { shareAFile } from '@/services/api'
import { FileItem } from '@/types/types'
import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { Eye, EyeOff } from 'lucide-react'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  file: FileItem | null
}

export function ShareDialog({ isOpen, onClose, file }: ShareDialogProps) {
  const [loading, setLoading] = useState(false)
  const [sharedWith, setSharedWith] = useState('')
  const [shareWithMessage, setShareWithMessage] = useState('')
  const [expirationDate, setExpirationDate] = useState(
    format(addDays(new Date(), 7), 'yyyy-MM-dd')
  )
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(false)
  const [password, setPassword] = useState('')
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const validateShareInputs = (): boolean => {
    if (!sharedWith) {
      toast({
        title: 'Provide Email',
        description: 'Please provide an email address to share with',
        variant: 'destructive',
      })
      return false
    }

    if (isExpirationEnabled) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const expirationDateObj = new Date(expirationDate)
      if (expirationDateObj < today) {
        toast({
          title: 'Expiration Date',
          description: 'Expiration date cannot be in the past.',
          variant: 'destructive',
        })
        return false
      }
    }

    if (isPasswordEnabled && (!password || password.length < 6)) {
      toast({
        title: 'Password',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const confirmShare = async () => {
    if (!validateShareInputs()) return
    setLoading(true)

    try {
      if (!file) {
        throw new Error('No file selected for sharing')
      }

      await shareAFile(
        file.id,
        isExpirationEnabled ? expirationDate : null,
        isPasswordEnabled ? password : null,
        sharedWith,
        shareWithMessage,
        isPasswordEnabled,
        isExpirationEnabled
      )

      toast({
        title: 'Share',
        variant: 'success',
        description: `File shared successfully with ${sharedWith}`,
      })

      onCancel()
    } catch (error) {
      console.error('Share error:', error)
      toast({
        title: 'Error',
        description: 'Failed to share file',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onCancel = () => {
    // Reset form fields
    setSharedWith('')
    setShareWithMessage('')
    setExpirationDate('')
    setIsExpirationEnabled(false)
    setPassword('')
    setIsPasswordEnabled(false)
    setIsPasswordShown(false)
    setAlertMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {file?.name}</DialogTitle>
        </DialogHeader>
        {alertMessage && (
          <Alert>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='sharedWith' className='text-right'>
              Share with
            </Label>
            <Input
              id='sharedWith'
              value={sharedWith}
              onChange={(e) => setSharedWith(e.target.value)}
              placeholder='Email address'
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='shareMessage' className='text-right'>
              Message
            </Label>
            <Input
              id='shareMessage'
              value={shareWithMessage}
              onChange={(e) => setShareWithMessage(e.target.value)}
              placeholder='Optional message'
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='expiration-date' className='text-right'>
              Expiration Date
            </Label>
            <Input
              id='expiration-date'
              type='date'
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={!isExpirationEnabled}
              className='col-span-3'
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Switch
              id='expiration-switch'
              checked={isExpirationEnabled}
              onCheckedChange={setIsExpirationEnabled}
            />
            <Label htmlFor='expiration-switch'>Enable Expiration</Label>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='password' className='text-right'>
              Password
            </Label>
            <div className='relative col-span-3'>
              <Input
                id='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isPasswordEnabled}
              />
              <button
                type='button'
                onClick={() => setIsPasswordShown(!isPasswordShown)}
                className='absolute inset-y-0 right-0 flex items-center pr-3'
              >
                {isPasswordShown ? (
                  <EyeOff className='h-4 w-4 text-gray-500' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-500' />
                )}
              </button>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Switch
              id='password-switch'
              checked={isPasswordEnabled}
              onCheckedChange={setIsPasswordEnabled}
            />
            <Label htmlFor='password-switch'>Enable Password</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={confirmShare} disabled={loading}>
            {loading ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
