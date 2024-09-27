import { Button } from '@/components/custom/button'

const EmailConfirmation = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg'>
        <h2 className='text-center text-3xl font-bold text-gray-900'>
          Confirm Your Email
        </h2>
        <p className='text-center text-sm text-gray-600'>
          We've sent a verification email to your email.
        </p>
        <p className='text-center text-lg font-medium text-blue-600'></p>
        <p className='text-center text-sm text-gray-600'>
          Please check your inbox and click the verification link to activate
          your account.
        </p>
        <p className='text-center text-xs text-gray-500'>
          If you don't see the email, please check your spam folder.
        </p>
        <div className='mt-6'>
          <Button
            className='w-full'
            onClick={() => (window.location.href = '/login')}
          >
            Proceed to Login
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailConfirmation
