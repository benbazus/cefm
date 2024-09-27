import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { HardDrive } from 'lucide-react'

export default function MapNetworkDrive() {
  const [driveLetter, setDriveLetter] = useState('')
  const [networkPath, setNetworkPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMapDrive = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/network-drive/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveLetter, networkPath }),
      })

      if (!response.ok) {
        throw new Error('Failed to map network drive')
      }

      toast({
        title: 'Success',
        description: 'Network drive mapped successfully',
      })

      setDriveLetter('')
      setNetworkPath('')
    } catch (error) {
      console.error('Error mapping network drive:', error)
      toast({
        title: 'Error',
        description: 'Failed to map network drive',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleMapDrive} className='space-y-4'>
      <div>
        <Label htmlFor='driveLetter'>Drive Letter</Label>
        <Input
          id='driveLetter'
          value={driveLetter}
          onChange={(e) => setDriveLetter(e.target.value)}
          placeholder='E'
          required
        />
      </div>
      <div>
        <Label htmlFor='networkPath'>Network Path</Label>
        <Input
          id='networkPath'
          value={networkPath}
          onChange={(e) => setNetworkPath(e.target.value)}
          placeholder='\\server\share'
          required
        />
      </div>
      <Button type='submit' disabled={isLoading}>
        <HardDrive className='mr-2 h-4 w-4' />
        {isLoading ? 'Mapping...' : 'Map Network Drive'}
      </Button>
    </form>
  )
}
