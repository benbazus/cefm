import { toast } from '@/components/ui/use-toast'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

export const formatSize = (size: number) => {
  if (!size) return 'N/A'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateString: string | number | Date) => {
  if (!dateString) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(dateString))
}

// Encode a folder ID
export function encodeFolderId(folderId: string): string {
  return btoa(folderId)
}

// Decode a folder ID
export function decodeFolder(encodedFolderId: string): string {
  return atob(encodedFolderId)
}

// Handle errors from Axios requests
export const handleError2 = (
  error: unknown,
  navigate: ReturnType<typeof useNavigate>
) => {
  if (axios.isAxiosError(error)) {
    const { response } = error

    // Log error details (remove in production)
    console.error('Axios Error:', response) // Commented out for production

    // Handle 401 Unauthorized errors (Redirect to login page)
    if (response?.status === 401) {
      // Redirect to login page
      navigate('/login') // Adjust the path based on your routing setup
      return // Prevent further execution
    }

    // Handle validation errors with detailed information
    if (response?.data?.errors) {
      const errors = Array.isArray(response.data.errors)
        ? response.data.errors
        : Object.values(response.data.errors)

      errors.forEach((err: { description: string }) => {
        toast({
          title: 'Error Occurred',
          description: (
            <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
              <code className='text-white'>{err.description}</code>
            </pre>
          ),
        })
      })
    } else {
      // Handle general error response
      toast({
        title: 'Error Occurred',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {response?.data?.message || 'An error occurred'}
            </code>
          </pre>
        ),
      })
    }
  } else {
    // Handle non-Axios errors
    toast({
      title: 'Unexpected Error',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred'}
          </code>
        </pre>
      ),
    })
  }
}
// Handle errors from Axios requests
export const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const err = error.response

    if (err?.status === 401) {
      window.location.href = '/login'
      return
    }

    // Handle validation errors with detailed information
    if (err?.data?.errors) {
      if (Array.isArray(err.data.errors)) {
        // If errors are an array
        err.data.errors.forEach((val: { description: string }) => {
          toast({
            title: 'Error Occurred',
            description: (
              <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                <code className='text-white'>
                  {JSON.stringify(val.description, null, 2)}
                </code>
              </pre>
            ),
          })
        })
      } else if (typeof err.data.errors === 'object') {
        // If errors are an object
        Object.keys(err.data.errors).forEach((key) => {
          toast({
            title: 'Error Occurred',
            description: (
              <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                <code className='text-white'>
                  {JSON.stringify(err.data.errors[key][0], null, 2)}
                </code>
              </pre>
            ),
          })
        })
      }
    } else if (err?.data) {
      // Handle general error response
      toast({
        title: 'Error Occurred',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(err.data, null, 2)}
            </code>
          </pre>
        ),
      })
    } else {
      // Handle other Axios errors
      toast({
        title: 'Error',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(err?.data || 'An error occurred', null, 2)}
            </code>
          </pre>
        ),
      })
    }
  } else {
    // Handle non-Axios errors
    toast({
      title: 'Unexpected Error',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(error, null, 2)}</code>
        </pre>
      ),
    })
  }
}

// Get the base URL for API calls
export const getURL = (path?: string) => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'

  // Ensure the URL starts with https:// when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Ensure the URL has a trailing slash.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`

  if (path) {
    path = path.replace(/^\/+/, '') // Remove leading slashes
    return path ? `${url}${path}` : url // Concatenate the URL and the path.
  }

  return url
}

// Convert seconds to DateTime
export const toDateTime = (secs: number) => {
  const t = new Date('1970-01-01T00:30:00Z') // Unix epoch start.
  t.setSeconds(secs)
  return t
}

// Calculate trial end Unix timestamp
export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined
  }

  const currentDate = new Date() // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  ) // Add trial days
  return Math.floor(trialEnd.getTime() / 1000) // Convert to Unix timestamp in seconds
}

// Toast redirect key map
const toastKeyMap: { [key: string]: string[] } = {
  status: ['status', 'status_description'],
  error: ['error', 'error_description'],
}

// Generate a toast redirect URL
const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType]

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`
  }

  return redirectPath
}

// Generate a status redirect URL
export const getStatusRedirect = (
  path: string,
  statusName: string,
  statusDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'status',
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams
  )

// Generate an error redirect URL
export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'error',
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  )
