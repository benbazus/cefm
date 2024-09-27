import { createBrowserRouter } from 'react-router-dom'
import GeneralError from './pages/errors/general-error'
import NotFoundError from './pages/errors/not-found-error'
import MaintenanceError from './pages/errors/maintenance-error'
import PrivateRoute from './components/private-route'
import AppShell from './components/app-shell'
import UnauthorisedError from './pages/errors/unauthorised-error'

const router = createBrowserRouter([
  // Auth routes

  {
    path: '/login',
    lazy: async () => ({
      Component: (await import('./pages/auth/login')).default,
    }),
  },
  {
    path: '/register',
    lazy: async () => ({
      Component: (await import('./pages/auth/register')).default,
    }),
  },
  {
    path: '/check-email',
    lazy: async () => ({
      Component: (await import('./pages/checkEmail')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password')).default,
    }),
  },
  {
    path: '/email-verification/:token',
    lazy: async () => ({
      Component: (await import('./pages/auth/email-verification')).default,
    }),
  },
  {
    path: '/sharedFile/:id',
    lazy: async () => ({
      Component: (await import('./pages/sharedFile')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp')).default,
    }),
  },
  {
    path: '/tos/terms',
    lazy: async () => ({
      Component: (await import('./pages/tos/terms')).default,
    }),
  },
  {
    path: '/tos/privacy',
    lazy: async () => ({
      Component: (await import('./pages/tos/privacy')).default,
    }),
  },
  {
    path: '/reset-password/:token',
    lazy: async () => ({
      Component: (await import('./pages/auth/reset-password')).default,
    }),
  },
  {
    path: '/registration-success',
    lazy: async () => ({
      Component: (await import('./pages/auth/registration-success')).default,
    }),
  },
  {
    path: '/document/v/:id',
    lazy: async () => ({
      Component: (await import('./pages/document/v')).default,
    }),
  },
  {
    path: '/document/n/:id',
    lazy: async () => ({
      Component: (await import('./pages/document/n')).default,
    }),
  },
  {
    path: '/document/:type/:id/:edit',
    lazy: async () => ({
      Component: (await import('./pages/document/e')).default,
    }),
  },
  {
    path: 'document/:id/:name',
    lazy: async () => ({
      Component: (await import('./pages/document')).default,
    }),
  },
  {
    path: 'document/:id',
    lazy: async () => ({
      Component: (await import('./pages/document')).default,
    }),
  },

  // Main routes
  {
    path: '/',

    element: (
      <PrivateRoute>
        <AppShell />
      </PrivateRoute>
    ),
    errorElement: <GeneralError />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/dashboard')).default,
        }),
      },
      {
        path: '/drive',
        lazy: async () => ({
          Component: (await import('./pages/drive/home')).default,
        }),
      },
      {
        path: '/drive/home',
        lazy: async () => ({
          Component: (await import('./pages/drive/home')).default,
        }),
      },
      {
        path: '/drive/documents',
        lazy: async () => ({
          Component: (await import('./pages/drive/pdf')).default,
        }),
      },
      {
        path: '/drive/document',
        lazy: async () => ({
          Component: (await import('./pages/drive/document')).default,
        }),
      },
      {
        path: '/drive/audio',
        lazy: async () => ({
          Component: (await import('./pages/drive/audio')).default,
        }),
      },
      {
        path: '/drive/video',
        lazy: async () => ({
          Component: (await import('./pages/drive/video')).default,
        }),
      },
      {
        path: '/drive/pdf',
        lazy: async () => ({
          Component: (await import('./pages/drive/pdf')).default,
        }),
      },
      {
        path: '/drive/word',
        lazy: async () => ({
          Component: (await import('./pages/drive/word')).default,
        }),
      },
      {
        path: '/drive/excel',
        lazy: async () => ({
          Component: (await import('./pages/drive/excel')).default,
        }),
      },
      {
        path: '/drive/photo',
        lazy: async () => ({
          Component: (await import('./pages/drive/photo')).default,
        }),
      },
      {
        path: '/drive/trash',
        lazy: async () => ({
          Component: (await import('./pages/drive/trash')).default,
        }),
      },
      {
        path: '/drive/share',
        lazy: async () => ({
          Component: (await import('./pages/drive/share')).default,
        }),
      },

      {
        path: '/drive/sharedwithme',
        lazy: async () => ({
          Component: (await import('./pages/drive/sharedwithme')).default,
        }),
      },
      {
        path: '/drive/folders/:folderId',
        lazy: async () => ({
          Component: (await import('./pages/drive/folders')).default,
        }),
      },
      {
        path: '/drive/folders',
        lazy: async () => ({
          Component: (await import('./pages/drive/folders')).default,
        }),
      },
      {
        path: 'document',
        lazy: async () => ({
          Component: (await import('./pages/document')).default,
        }),
      },
      // {
      //   path: 'FilePreview',
      //   lazy: async () => ({
      //     Component: (await import('./pages/FileUpload')).default,
      //   }),
      // },
      // {
      //   path: 'document/:id/:name',
      //   lazy: async () => ({
      //     Component: (await import('./pages/document')).default,
      //   }),
      // },
      // {
      //   path: 'document/:id',
      //   lazy: async () => ({
      //     Component: (await import('./pages/document')).default,
      //   }),
      // },
      {
        path: 'editor/:id',
        lazy: async () => ({
          Component: (await import('./pages/checkEmail')).default,
        }),
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('./pages/settings')).default,
        }),
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/settings/profile')).default,
            }),
          },
          {
            path: 'account',
            lazy: async () => ({
              Component: (await import('./pages/settings/account')).default,
            }),
          },
          {
            path: 'appearance',
            lazy: async () => ({
              Component: (await import('./pages/settings/appearance')).default,
            }),
          },
          {
            path: 'notifications',
            lazy: async () => ({
              Component: (await import('./pages/settings/notifications'))
                .default,
            }),
          },
          {
            path: 'display',
            lazy: async () => ({
              Component: (await import('./pages/settings/display')).default,
            }),
          },
          // {
          //   path: 'error-example',
          //   lazy: async () => ({
          //     Component: (await import('./pages/settings/error-example'))
          //       .default,
          //   }),
          //   errorElement: <GeneralError className='h-[50svh]' minimal />,
          // },
        ],
      },
    ],
  },

  // Error routes
  { path: '/500', Component: GeneralError },
  { path: '/404', Component: NotFoundError },
  { path: '/503', Component: MaintenanceError },
  { path: '/401', Component: UnauthorisedError },

  // Fallback 404 route
  { path: '*', Component: NotFoundError },
])

export default router
