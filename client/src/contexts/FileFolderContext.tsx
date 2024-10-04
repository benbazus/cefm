import React, { createContext, useContext, useState, useCallback } from 'react'

// Define the shape of the context
interface FolderFileContextType {
  refresh: number
  triggerRefresh: () => void
}

// Create the context
const FolderFileContext = createContext<FolderFileContextType | undefined>(
  undefined
)

// Context Provider component
export const FolderFileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [refresh, setRefresh] = useState(0)

  // Function to trigger a refresh
  const triggerRefresh = useCallback(() => {
    setRefresh((prev) => prev + 1)
  }, [])

  return (
    <FolderFileContext.Provider value={{ refresh, triggerRefresh }}>
      {children}
    </FolderFileContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFolderFile = () => {
  const context = useContext(FolderFileContext)
  if (context === undefined) {
    throw new Error('useFolderFile must be used within a FolderFileProvider')
  }
  return context
}
