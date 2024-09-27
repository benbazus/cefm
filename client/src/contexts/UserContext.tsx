import React, { createContext, useContext, useState } from 'react'

export interface ViewState {
  contentType: 'files' | 'folders'
  viewType: 'list' | 'grid'
}

interface ViewContextType {
  selectedView: ViewState
  setSelectedView: React.Dispatch<React.SetStateAction<ViewState>>
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedView, setSelectedView] = useState<ViewState>({
    contentType: 'files',
    viewType: 'grid',
  })

  return (
    <ViewContext.Provider value={{ selectedView, setSelectedView }}>
      {children}
    </ViewContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useView = (): ViewContextType => {
  const context = useContext(ViewContext)
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider')
  }
  return context
}
