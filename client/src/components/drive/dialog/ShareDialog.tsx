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
import { FileItem } from '@/types/types'

interface ShareDialogProps {
  shareFile: FileItem | null
  sharedWith: string
  shareWithMessage: string
  expirationDate: string
  isExpirationEnabled: boolean
  isPasswordEnabled: boolean
  isPasswordShown: boolean
  password: string
  alertMessage?: string
  alertSeverity?: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
  setSharedWith: (value: string) => void
  setShareWithMessage: (value: string) => void
  setExpirationDate: (value: string) => void
  setIsExpirationEnabled: (value: boolean) => void
  setIsPasswordEnabled: (value: boolean) => void
  setIsPasswordShown: (value: boolean) => void
  setPassword: (value: string) => void
}

export function ShareDialog({
  shareFile,
  sharedWith,
  shareWithMessage,
  expirationDate,
  isExpirationEnabled,
  isPasswordEnabled,
  isPasswordShown,
  password,
  alertMessage,

  loading,
  onCancel,
  onConfirm,
  setSharedWith,
  setShareWithMessage,
  setExpirationDate,
  setIsExpirationEnabled,
  setIsPasswordEnabled,
  setIsPasswordShown,
  setPassword,
}: ShareDialogProps) {
  return (
    <Dialog open={!!shareFile} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {shareFile?.name}</DialogTitle>
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
                {isPasswordShown ? 'Hide' : 'Show'}
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
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
