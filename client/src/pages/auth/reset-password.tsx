import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { ResetPasswordForm } from './components/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <main className='container grid h-screen flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0'>
      <section className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>
        <Card className='p-6'>
          <div className='mb-2 flex flex-col space-y-2 text-left'>
            <h1 className='text-lg font-semibold tracking-tight'>
              Enter New Password
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your password to reset your account.
              <br />
              Already have an account?{' '}
              <Link
                to='/login'
                className='underline underline-offset-4 hover:text-primary'
              >
                Sign In
              </Link>
            </p>
          </div>
          <ResetPasswordForm />
        </Card>
      </section>
    </main>
  )
}

// import { Card } from '@/components/ui/card'

// import { Link } from 'react-router-dom'
// import { ResetPasswordForm } from './components/reset-password-form'

// export default function ResetPasswordPage() {
//   return (
//     <>
//       <div className='container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0'>
//         <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>
//           <Card className='p-6'>
//             <div className='mb-2 flex flex-col space-y-2 text-left'>
//               <h1 className='text-lg font-semibold tracking-tight'>
//                 Enter New Password
//               </h1>
//               <p className='text-sm text-muted-foreground'>
//                 Enter your password to reset an account. <br />
//                 Already have an account?{' '}
//                 <Link
//                   to='/login'
//                   className='underline underline-offset-4 hover:text-primary'
//                 >
//                   Sign In
//                 </Link>
//               </p>
//             </div>
//             <ResetPasswordForm />
//           </Card>
//         </div>
//       </div>
//     </>
//   )
// }
