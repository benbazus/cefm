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
import AuthProvider from './hooks/use-app-state'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider>
        <ViewProvider>
          <FolderFileProvider>
            <FolderProvider>
              <RouterProvider router={router} />
              <Toaster />
            </FolderProvider>
          </FolderFileProvider>
        </ViewProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
