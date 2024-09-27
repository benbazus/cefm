import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/custom/button'
import { newVerification } from '@/services/api'
import { VerificationResponse } from '@/types/types'

export default function EmailVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = location.pathname.split('/')[2]

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const verifyToken = useCallback(
    async (token: string) => {
      setLoading(true)

      try {
        const data: VerificationResponse | null = await newVerification(token)

        if (data?.success) {
          toast({
            title: 'Success',
            description: data.success,
            duration: 5000,
          })
          navigate('/login')
        } else if (data?.error) {
          setErrorMessage(data.error)
        }
      } catch (error) {
        setErrorMessage('An unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    },
    [navigate, toast]
  )

  useEffect(() => {
    if (token) {
      verifyToken(token)
    }
  }, [token, verifyToken])

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='w-full max-w-md space-y-6 rounded-lg bg-card p-6 shadow-lg'>
        <h2 className='text-center text-3xl font-bold'>Email Verification</h2>
        {loading ? (
          <div className='flex justify-center'>
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Verifying
            </Button>
          </div>
        ) : (
          <>
            {errorMessage ? (
              <Alert variant='destructive'>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTitle>Verifying your email</AlertTitle>
                <AlertDescription>
                  We are verifying your email address. Please hold on a moment
                  while we process your request.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// import { useCallback, useEffect, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// import { useToast } from '@/components/ui/use-toast'
// import { Loader2 } from 'lucide-react'
// import { Button } from '@/components/custom/button'
// import { newVerification } from '@/services/api'

// export default function EmailVerification() {
//   const navigate = useNavigate()

//   const location = useLocation()
//   const token = location.pathname.split('/')[2]

//   const [errorMessage, setErrorMessage] = useState<string | null>(null)
//   const [loading, setLoading] = useState<boolean>(false)
//   const { toast } = useToast()

//   const verifyToken = useCallback(
//     async (token: string) => {
//       setLoading(true)

//       try {
//         const data = await newVerification(token)

//         if (data.success) {
//           toast({
//             title: 'Success',
//             description: data.success,
//             duration: 5000,
//           })
//           navigate('/login')
//         } else if (data.error) {
//           setErrorMessage(data.error)
//         }
//       } catch (error) {
//         setErrorMessage('An unexpected error occurred.')
//       } finally {
//         setLoading(false)
//       }
//     },
//     [navigate, toast]
//   )

//   useEffect(() => {
//     if (token) {
//       verifyToken(token)
//     }
//   }, [token, verifyToken])

//   return (
//     <div className='flex min-h-screen items-center justify-center bg-background'>
//       <div className='w-full max-w-md space-y-6 rounded-lg bg-card p-6 shadow-lg'>
//         <h2 className='text-center text-3xl font-bold'>Email Verification</h2>
//         {loading ? (
//           <div className='flex justify-center'>
//             <Button disabled>
//               <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//               Verifying
//             </Button>
//           </div>
//         ) : (
//           <>
//             {errorMessage ? (
//               <Alert variant='destructive'>
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription>{errorMessage}</AlertDescription>
//               </Alert>
//             ) : (
//               <Alert>
//                 <AlertTitle>Verifying your email</AlertTitle>
//                 <AlertDescription>
//                   We are verifying your email address. Please hold on a moment
//                   while we process your request.
//                 </AlertDescription>
//               </Alert>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   )
// }
