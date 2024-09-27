import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { useFolder } from '@/contexts/FolderContext'
import { decodeFolder } from '@/utils/helpers'
import { Breadcrumb, BreadcrumbItem } from './breadcrumb'

export const BreadcrumbNav: React.FC = () => {
  const location = useLocation()
  const { folderName } = useFolder()

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const isInDrive = pathSegments[0] === 'drive'

  if (!isInDrive) {
    return null
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`
    let label = segment.charAt(0).toUpperCase() + segment.slice(1)

    if (
      segment === 'folders' &&
      index === pathSegments.length - 1 &&
      folderName
    ) {
      label = decodeFolder(folderName)
    }

    return { label, url }
  })

  return (
    <Breadcrumb separator={<ChevronRight className='h-4 w-4' />}>
      {breadcrumbs.map((crumb, index) => (
        <BreadcrumbItem key={crumb.url}>
          {index === breadcrumbs.length - 1 ? (
            <span className='font-medium'>{crumb.label}</span>
          ) : (
            <Link
              to={crumb.url}
              className='text-muted-foreground hover:text-foreground'
            >
              {crumb.label}
            </Link>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}
