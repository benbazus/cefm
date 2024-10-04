// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { handleError } from '@/utils/helpers'
// import { signIn, signOut } from '@/services/api'
// import { AuthResponse } from '@/types/types'
// import { toast } from '@/components/ui/use-toast'

// const useAuth = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     !!localStorage.getItem('token')
//   )
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()

//   const logIn = async (
//     email: string,
//     password: string,
//     code: string,
//     callbackUrl: string
//   ) => {
//     try {
//       setLoading(true)
//       const response = (await signIn(
//         email,
//         password,
//         code
//       )) as AuthResponse

//       if (response?.twoFactor) {
//         toast({
//           title: 'Enter the authentication code',
//           description: 'We have sent the authentication code to your email.',
//           variant: 'success',
//         })
//         navigate('/otp', { state: { email, password } })
//         return
//       }

//       if (response?.accessToken) {
//         localStorage.setItem('token', response.accessToken)
//         setIsAuthenticated(true)
//         toast({
//           title: 'Success',
//           description: 'Logged in successfully.',
//           variant: 'success',
//         })
//         navigate(callbackUrl)
//       } else if (response?.success) {
//         navigate('/check-email')
//       } else if (response?.error) {
//         throw new Error(response.error)
//       }
//     } catch (error) {
//       handleError(error)
//       throw error // Re-throw the error to be caught in the component
//     } finally {
//       setLoading(false)
//     }
//   }

//   const logOut = async () => {
//     try {
//       await signOut('null')
//       localStorage.removeItem('token')
//       setIsAuthenticated(false)
//       navigate('/login')
//     } catch (error) {
//       handleError(error)
//     }
//   }

//   return { isAuthenticated, loading, logIn, logOut }
// }

// export default useAuth
