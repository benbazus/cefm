import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { Button } from '../custom/button'

interface Folder {
  id: string
  name: string
  children: Folder[]
}

interface FolderTreeProps {
  folders: Folder[]
  selectedFolder: string | null
  onSelectFolder: (folderId: string) => void
}

export function FolderTree({
  folders,
  selectedFolder,
  onSelectFolder,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderFolder = (folder: Folder, depth: number) => {
    const isSelected = folder.id === selectedFolder
    const hasChildren = folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)

    return (
      <React.Fragment key={folder.id}>
        <tr
          className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
          onClick={() => onSelectFolder(folder.id)}
        >
          <td className='pl-custom relative m-0 flex flex-nowrap items-center'>
            <div
              className='folder-tree-list-item-indent flex shrink-0'
              style={{ width: `${depth * 1.5}em` }}
            ></div>
            <div className='folder-tree-list-item-expand relative shrink-0'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.id)
                }}
              >
                {hasChildren &&
                  (isExpanded ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  ))}
              </Button>
            </div>
            <div className='folder-tree-list-item-name flex w-full flex-nowrap items-center'>
              <Folder className='mr-2 h-4 w-4' />
              <span className='text-nowrap pr-8'>{folder.name}</span>
            </div>
          </td>
        </tr>
        {isExpanded &&
          hasChildren &&
          folder.children.map((childFolder) =>
            renderFolder(childFolder, depth + 1)
          )}
      </React.Fragment>
    )
  }

  return (
    <div className='folder-tree h-[50vh] overflow-y-auto'>
      <table className='folder-tree-table w-full'>
        <tbody>{folders.map((folder) => renderFolder(folder, 0))}</tbody>
      </table>
    </div>
  )
}
