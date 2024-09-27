import { useLocation, Navigate } from 'react-router-dom'
import { Button } from '@/components/custom/button'

const RegistrationSuccess = () => {
  const location = useLocation()
  const email = location.state?.email

  // Redirect to registration page if email is not available
  if (!email) {
    return <Navigate to='/register' replace />
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Registration Successful!
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Thank you for registering. We've sent a verification email to:
        </p>
        <p className='mt-2 text-center text-lg font-medium text-blue-600'>
          {email}
        </p>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Please check your email and click the verification link to activate
          your account.
        </p>
        <div className='mt-6'>
          <Button
            className='w-full'
            onClick={() => (window.location.href = '/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RegistrationSuccess
