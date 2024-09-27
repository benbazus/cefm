import { useState, useEffect, useCallback } from 'react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, Lock, Copy } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import {
  changeFileSharePermission,
  getDocumentUsers,
  shareDocumentToUser,
} from '@/services/api'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/custom/button'
import { Pagination } from '@/components/ui/pagination'

interface User {
  id: string
  name: string
  email: string
  permission: 'SHARE' | 'WRITE' | 'READ' | 'DELETE'
  sharedDate: string
}

export default function ShareSettings({ documentId }: { documentId: string }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [permission, setPermission] = useState<'WRITE' | 'READ'>('READ')
  const [generalAccess, setGeneralAccess] = useState<'RESTRICTED' | 'ANYONE'>(
    'RESTRICTED'
  )
  const [users, setUsers] = useState<User[]>([])
  const [currentUrl, setCurrentUrl] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const usersPerPage = 2

  const fetchUsers = useCallback(async () => {
    try {
      const fetchedUsers = (await getDocumentUsers(documentId)) as User[]
      setUsers(fetchedUsers)
      setTotalPages(Math.ceil(fetchedUsers.length / usersPerPage))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [documentId])

  useEffect(() => {
    fetchUsers()
    const baseUrl = window.location.href
    setCurrentUrl(modifyUrl(baseUrl, permission))
  }, [documentId, fetchUsers, permission])

  const modifyUrl = (url: string, perm: 'WRITE' | 'READ') => {
    const urlParts = url.split('/')
    if (perm === 'READ') {
      urlParts[urlParts.length - 3] = 'v'
      urlParts[urlParts.length - 1] = 'view'
    } else if (perm === 'WRITE') {
      urlParts[urlParts.length - 3] = 'd'
      urlParts[urlParts.length - 1] = 'edit'
    }
    return urlParts.join('/')
  }

  useEffect(() => {
    fetchUsers()
    setCurrentUrl(window.location.href)
  }, [documentId, fetchUsers])

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(String(email).toLowerCase())
  }

  const handleShare = async () => {
    if (!validateEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }

    const currentUserEmail = localStorage.getItem('userEmail')
    if (email === currentUserEmail) {
      toast({
        title: 'Invalid recipient',
        description: 'You cannot share the document with yourself.',
        variant: 'destructive',
      })
      return
    }

    try {
      await shareDocumentToUser(
        documentId,
        email,
        message,
        permission,
        currentUrl,
        generalAccess
      )
      toast({
        title: 'Document shared',
        description: 'The document has been shared successfully.',
      })
      fetchUsers()
      setEmail('')
      setMessage('')
    } catch (error) {
      console.error('Error sharing document:', error)
      toast({
        title: 'Error',
        description: 'Failed to share the document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    toast({
      title: 'Link copied',
      description: 'The document link has been copied to your clipboard.',
    })
  }

  const handlePermissionChange = async (
    userId: string,
    newPermission: 'WRITE' | 'READ'
  ) => {
    try {
      await changeFileSharePermission(documentId, newPermission)
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, permission: newPermission } : user
        )
      )
      toast({
        title: 'Permission updated',
        description: 'User permission has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating permission:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user permission. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const paginatedUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  return (
    <div className='mx-auto w-full max-w-3xl'>
      <div className='space-y-2'>
        <div className='space-y-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='email' className='text-right'>
              Email
            </Label>
            <Input
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='col-span-3 max-w-full text-sm'
              required
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='message' className='text-right'>
              Message
            </Label>
            <Textarea
              id='message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='col-span-3 max-w-full text-sm'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='permission' className='text-right'>
              Permission
            </Label>
            <Select
              value={permission}
              onValueChange={(value) =>
                setPermission(value as 'WRITE' | 'READ')
              }
            >
              <SelectTrigger className='w-[180px] text-sm'>
                <SelectValue placeholder='Select permission' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='WRITE'>Editor</SelectItem>
                <SelectItem value='READ'>Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h3 className='mb-2 text-lg font-semibold'>People with access</h3>
          <Table className='text-xs'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-1/4'>Name</TableHead>
                <TableHead className='w-1/4'>Email</TableHead>
                <TableHead className='w-1/4'>Permission</TableHead>
                <TableHead className='w-1/4'>Shared Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.permission}
                      onValueChange={(value) =>
                        handlePermissionChange(
                          user.id,
                          value as 'WRITE' | 'READ'
                        )
                      }
                      disabled={user.permission === 'SHARE'}
                    >
                      <SelectTrigger className='w-[100px] text-xs'>
                        <SelectValue placeholder='Select permission' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='WRITE'>Editor</SelectItem>
                        <SelectItem value='READ'>Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {new Date(user.sharedDate).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        <div>
          <h3 className='mb-2 text-lg font-semibold'>General access</h3>
          <div className='flex items-center space-x-2'>
            <Lock className='h-5 w-5 text-muted-foreground' />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='w-[200px] justify-between'>
                  {generalAccess === 'RESTRICTED'
                    ? 'Restricted'
                    : 'Anyone with the link'}
                  <ChevronDown className='h-4 w-4 opacity-50' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-[200px]'>
                <DropdownMenuRadioGroup
                  value={generalAccess}
                  onValueChange={(value) =>
                    setGeneralAccess(value as 'RESTRICTED' | 'ANYONE')
                  }
                >
                  <DropdownMenuRadioItem value='RESTRICTED'>
                    Restricted
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='ANYONE'>
                    Anyone with the link
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {generalAccess === 'RESTRICTED'
              ? 'Only people with access can open the link'
              : 'Anyone with the link can view'}
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleCopyLink}>
            <Copy className='mr-2 h-4 w-4' />
            Copy Link
          </Button>
          <Input value={currentUrl} readOnly className='flex-grow text-sm' />
        </div>
        <Button onClick={handleShare}>Share Document</Button>
      </div>
    </div>
  )
}
