import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import router from '@/router'
import '@/index.css'
import { ViewProvider } from './contexts/UserContext'
import { FolderProvider } from './contexts/FolderContext'
import { FolderFileProvider } from './contexts/FileFolderContext'
//import { AppStateProvider } from './hooks/use-app-state'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      {/* <AppStateProvider> */}
      <ViewProvider>
        <FolderFileProvider>
          <FolderProvider>
            <RouterProvider router={router} />
            <Toaster />
          </FolderProvider>
        </FolderFileProvider>
      </ViewProvider>
      {/* </AppStateProvider> */}
    </ThemeProvider>
  </React.StrictMode>
)
