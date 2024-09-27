import React, { createContext, useState, useContext, useCallback } from 'react'

interface FolderContextProps {
  folderId: string | null
  folderName: string | null
  setFolderId: (id: string) => void
  setFolderName: (name: string) => void
  breadcrumbs: { id: string; name: string }[]
  setBreadcrumbs: (breadcrumbs: { id: string; name: string }[]) => void
  currentFolder: { id: string | null; name: string | null }
}

const FolderContext = createContext<FolderContextProps | undefined>(undefined)

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [folderId, setFolderId] = useState<string | null>(null)
  const [folderName, setFolderName] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; name: string }[]
  >([])

  const setFolderIdCallback = useCallback((id: string) => {
    setFolderId(id)
  }, [])

  const setFolderNameCallback = useCallback((name: string) => {
    setFolderName(name)
  }, [])

  const setBreadcrumbsCallback = useCallback(
    (newBreadcrumbs: { id: string; name: string }[]) => {
      setBreadcrumbs(newBreadcrumbs)
    },
    []
  )

  const currentFolder = {
    id: folderId,
    name: folderName,
  }

  return (
    <FolderContext.Provider
      value={{
        folderId,
        folderName,
        setFolderId: setFolderIdCallback,
        setFolderName: setFolderNameCallback,
        breadcrumbs,
        setBreadcrumbs: setBreadcrumbsCallback,
        currentFolder,
      }}
    >
      {children}
    </FolderContext.Provider>
  )
}

export const useFolder = () => {
  const context = useContext(FolderContext)
  if (!context) {
    throw new Error('useFolder must be used within a FolderProvider')
  }
  return context
}

export default FolderProvider
