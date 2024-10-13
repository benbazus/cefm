import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileItem, FileVersion } from '@/types/types'
import { getFileVersions, restoreFileVersion } from '@/services/api'
import { RefreshCw } from 'lucide-react'

interface VersionsDialogProps {
  isOpen: boolean
  onClose: () => void
  file: FileItem | null
  onVersionRestored: () => void
}

const VersionsDialog: React.FC<VersionsDialogProps> = ({
  isOpen,
  onClose,
  file,
  onVersionRestored,
}) => {
  const [versions, setVersions] = useState<FileVersion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [restoreLoading, setRestoreLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchVersions = async () => {
      if (!file?.id) return
      setLoading(true)
      setVersions([])
      try {
        const fileVersions = (await getFileVersions(file.id)) as FileVersion[]
        setVersions(fileVersions)
      } catch (error) {
        console.error('Error fetching file versions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && file) {
      fetchVersions()
    } else {
      setVersions([])
    }
  }, [isOpen, file])

  const handleRestoreVersion = async (versionId: string) => {
    if (!file?.id) return
    setRestoreLoading(versionId)
    try {
      await restoreFileVersion(file.id, versionId)
      onVersionRestored()
      onClose()
    } catch (error) {
      console.error('Error restoring file version:', error)
    } finally {
      setRestoreLoading(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Manage Versions </DialogTitle>
          <DialogDescription>
            Older versions of '{file?.name}' may be deleted after 30 days or
            after 100 versions are stored. To avoid deletion, select Keep
            forever. Versions are listed by upload order.
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          {loading ? (
            <p>Loading versions...</p>
          ) : versions.length === 0 ? (
            <p>No versions available for this file.</p>
          ) : (
            <ul className='space-y-2'>
              {versions.map((version) => (
                <li
                  key={version.id}
                  className='flex items-center justify-between'
                >
                  <span>
                    Version {version.versionNumber} -{' '}
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                  <Button
                    onClick={() => handleRestoreVersion(version.id)}
                    disabled={restoreLoading === version.id}
                    variant='ghost'
                    size='icon'
                  >
                    {restoreLoading === version.id ? (
                      <RefreshCw className='animate-spin' />
                    ) : (
                      <RefreshCw />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter className='sm:justify-start'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VersionsDialog
