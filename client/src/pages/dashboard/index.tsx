import { useEffect, useState } from 'react'
import {
  getRecentActivity,
  getStorageInfo,
  getTotalFiles,
  getFileTypeDistribution,
  getStorageUsageHistory,
  getFileUploadsPerDay,
} from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileIcon, HardDriveIcon, ClockIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

import { FileTypePieChart } from '@/components/drive/charts/file-type-chart'
import { FileUploadsBarChart } from '@/components/drive/charts/bar-chart'
import { StorageUsageLineChart } from '@/components/drive/charts/storage-useage-chart'
import MapNetworkDrive from '@/components/drive/MapNetworkDrive'
import {
  FileActivity,
  FileTypeDistribution,
  FileUploadsPerDay,
  StorageInfo,
  StorageUsageHistory,
} from '@/types/types'

export default function Dashboard() {
  const [recentActivity, setRecentActivity] = useState<FileActivity[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    total: 1,
    documentUsage: 0,
    imageUsage: 0,
    mediaUsage: 0,
  })
  const [totalFiles, setTotalFiles] = useState(0)
  const [fileTypeDistribution, setFileTypeDistribution] =
    useState<FileTypeDistribution | null>(null)
  const [storageUsageHistory, setStorageUsageHistory] =
    useState<StorageUsageHistory | null>(null)
  const [fileUploadsPerDay, setFileUploadsPerDay] =
    useState<FileUploadsPerDay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [
          activity,
          storage,
          files,
          typeDistribution,
          usageHistory,
          uploadsPerDay,
        ] = await Promise.all([
          getRecentActivity(),
          getStorageInfo(),
          getTotalFiles(),
          getFileTypeDistribution(),
          getStorageUsageHistory(),
          getFileUploadsPerDay(),
        ])

        console.log(' ++++++++++++activity++++++++++++++++++++++ ')
        console.log(activity)
        console.log(' +++++++++++++activity+++++++++++++++++++++ ')

        setRecentActivity(activity || [])
        setStorageInfo(
          storage || {
            used: 0,
            total: 1,
            documentUsage: 0,
            imageUsage: 0,
            mediaUsage: 0,
          }
        )
        setTotalFiles(files || 0)
        setFileTypeDistribution(typeDistribution)
        setStorageUsageHistory(usageHistory)
        setFileUploadsPerDay(uploadsPerDay)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const usedPercentage =
    storageInfo.total > 0 ? (storageInfo.used / storageInfo.total) * 100 : 0
  const formatPercentage = (value: number) =>
    isNaN(value) ? '0%' : `${value.toFixed(1)}%`

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Storage Used</CardTitle>
            <HardDriveIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatPercentage(usedPercentage)}
            </div>
            <Progress value={usedPercentage} className='mt-2' />
            <p className='mt-2 text-xs text-muted-foreground'>
              {(storageInfo.used / 1024 / 1024 / 1024).toFixed(2)} GB of{' '}
              {(storageInfo.total / 1024 / 1024 / 1024).toFixed(2)} GB used
            </p>
            <div className='mt-4 space-y-2'>
              <div className='flex justify-between text-xs'>
                <span>Documents:</span>
                <span>
                  {formatPercentage(
                    (storageInfo.documentUsage / storageInfo.total) * 100
                  )}
                </span>
              </div>
              <Progress
                value={(storageInfo.documentUsage / storageInfo.total) * 100}
                className='h-1'
              />
              <div className='flex justify-between text-xs'>
                <span>Images:</span>
                <span>
                  {formatPercentage(
                    (storageInfo.imageUsage / storageInfo.total) * 100
                  )}
                </span>
              </div>
              <Progress
                value={(storageInfo.imageUsage / storageInfo.total) * 100}
                className='h-1'
              />
              <div className='flex justify-between text-xs'>
                <span>Media:</span>
                <span>
                  {formatPercentage(
                    (storageInfo.mediaUsage / storageInfo.total) * 100
                  )}
                </span>
              </div>
              <Progress
                value={(storageInfo.mediaUsage / storageInfo.total) * 100}
                className='h-1'
              />
            </div>
          </CardContent>
        </Card>
        <Card className='hidden'>
          <CardHeader>
            <CardTitle>Map Network Drive</CardTitle>
          </CardHeader>
          <CardContent>
            <MapNetworkDrive />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Files</CardTitle>
            <FileIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalFiles}</div>
            <p className='text-xs text-muted-foreground'>Files in your drive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Recent Activity
            </CardTitle>
            <ClockIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{recentActivity.length}</div>
            <p className='text-xs text-muted-foreground'>
              actions in the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>File Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {fileTypeDistribution && (
              <FileTypePieChart data={fileTypeDistribution} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {storageUsageHistory && (
              <StorageUsageLineChart data={storageUsageHistory} />
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>File Uploads per Day</CardTitle>
        </CardHeader>
        <CardContent>
          {fileUploadsPerDay && (
            <FileUploadsBarChart data={fileUploadsPerDay} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-8'>
            {recentActivity.map((activity) => (
              <div key={activity.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage src={activity?.user?.avatar} alt='Avatar' />
                  <AvatarFallback>
                    {activity?.user?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {activity?.user?.name}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {activity?.user?.email}
                  </p>
                </div>
                <div className='ml-auto text-sm text-muted-foreground'>
                  {activity?.action} {activity?.fileName}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
