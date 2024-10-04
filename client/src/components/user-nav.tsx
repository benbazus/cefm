import React, { useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/custom/button'
import { createNewFolder, uploadFilesAndFolders } from '@/services/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconFolderPlus,
  IconFilePlus,
  IconFolders,
} from '@tabler/icons-react'
import { toast } from '@/components/ui/use-toast'
import ThemeSwitch from './theme-switch'
import { CreateFolderDialog } from './drive/dialog/CreateFolderDialog'
import { useFolder } from '@/contexts/FolderContext'
import { useFolderFile } from '@/contexts/FileFolderContext'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { FileUploadDialog } from './drive/dialog/FileUploadDialog'
import { useAuth } from '@/hooks/use-app-state'

interface CustomFile extends File {
  webkitGetAsEntry?: () => FileSystemEntry | null
}

export function UserNav() {
  const { logOutUser, loading, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    useState(false)
  const [isOpenFolderUpload, setIsOpenFolderUpload] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const { folderId } = useFolder()
  const { triggerRefresh } = useFolderFile()

  const folderInputRef = useRef<HTMLInputElement>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logOutUser()
      navigate('/login')
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      })
    } catch (err) {
      console.error('Error logging out:', err)
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleProfileClick = () => {
    setIsMenuOpen(false)
    navigate('/settings')
  }

  const handleSettingsClick = () => {
    setIsMenuOpen(false)
    navigate('/settings')
  }

  const handleCreateFolder = () => {
    setIsCreateFolderDialogOpen(true)
  }

  const handleCreateFiles = () => {
    setIsDialogOpen(true)
  }

  const handleAddFiles = () => {
    setIsDialogOpen(true)
  }

  const handleAddFolders = () => {
    setIsOpenFolderUpload(true)
  }

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        const items = Array.from(files).map((file) => ({
          webkitGetAsEntry: () =>
            (file as CustomFile).webkitGetAsEntry?.() || null,
        })) as unknown as DataTransferItemList

        try {
          setUploadProgress(0)

          const result = await uploadFilesAndFolders(
            items,
            folderId as string,
            (progress) => {
              setUploadProgress(progress)
            }
          )
          console.log('Upload completed:', result)
          toast({
            variant: 'success',
            title: 'Upload Successful',
            description: 'Files and folders have been uploaded successfully.',
          })
          triggerRefresh()
          setIsOpenFolderUpload(false)
        } catch (error) {
          console.error('Upload failed:', error)
          toast({
            title: 'Upload Failed',
            description:
              'There was an error uploading the files and folders. Please try again.',
            variant: 'destructive',
          })
        } finally {
          setUploadProgress(null)
        }
      }
    },
    [folderId, triggerRefresh]
  )

  const handleCloseDialog = () => {
    setIsOpenFolderUpload(false)
    setUploadProgress(null)
  }

  const isDrivePage = React.useMemo(() => {
    const allowedPaths = [
      '/drive/home',
      '/drive/folders',
      '/drive/documents',
      '/drive/excel',
      '/drive/photo',
    ]

    if (allowedPaths.includes(location.pathname)) {
      return true
    }

    const folderPattern = /^\/drive\/folders\/[A-Za-z0-9+/=]+$/
    return folderPattern.test(location.pathname)
  }, [location.pathname])

  if (loading) return <div>Loading...</div>

  if (currentUser?.id) {
    localStorage.setItem('userId', currentUser.id)
  }

  return (
    <div className='flex items-center space-x-4'>
      {isDrivePage && (
        <>
          <Button onClick={handleCreateFolder} variant='outline' size='icon'>
            <IconFolderPlus className='h-4 w-4' />
            <span className='sr-only'>Create Folder</span>
          </Button>

          <Button
            onClick={handleCreateFiles}
            variant='outline'
            size='icon'
            className='hidden'
          >
            <IconFilePlus className='h-4 w-4' />
            <span className='sr-only'>Create Files</span>
          </Button>

          <Button
            onClick={handleAddFiles}
            variant='outline'
            size='icon'
            className='hidden'
          >
            <IconFilePlus className='h-4 w-4' />
            <span className='sr-only'>Add Files</span>
          </Button>
          <Button
            onClick={handleAddFolders}
            variant='outline'
            size='icon'
            className='hidden'
          >
            <IconFolders className='h-4 w-4' />
            <span className='sr-only'>Add Folders</span>
          </Button>
        </>
      )}

      <FileUploadDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <input
        type='file'
        onChange={handleFileChange}
        multiple
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        webkitdirectory=''
        directory=''
        style={{ display: 'none' }}
        ref={folderInputRef}
      />
      <ThemeSwitch />

      <CreateFolderDialog
        isOpen={isCreateFolderDialogOpen}
        onClose={() => setIsCreateFolderDialogOpen(false)}
        onCreateFolder={async (folderName) => {
          await createNewFolder(folderName, folderId)
          setIsCreateFolderDialogOpen(false)
          triggerRefresh()
        }}
      />

      <Dialog open={isOpenFolderUpload} onOpenChange={setIsOpenFolderUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload folder</DialogTitle>
          </DialogHeader>
          <div>
            <input
              type='file'
              onChange={handleFileChange}
              multiple
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              webkitdirectory=''
              directory=''
            />
            {uploadProgress !== null && (
              <div className='progress-bar'>
                Upload progress: {uploadProgress}%
              </div>
            )}
            <DialogFooter>
              <Button
                type='button'
                variant='secondary'
                onClick={handleCloseDialog}
              >
                Close
              </Button>
              <Button
                type='submit'
                onClick={() => folderInputRef.current?.click()}
              >
                Upload
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={currentUser?.image || '/avatars/default.png'}
                alt={currentUser?.name || 'User Avatar'}
              />
              <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {currentUser?.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {currentUser?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleProfileClick}>
              <IconUser className='mr-2 h-4 w-4' />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <IconSettings className='mr-2 h-4 w-4' />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <IconLogout className='mr-2 h-4 w-4' />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
