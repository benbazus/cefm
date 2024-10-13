import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import { cn } from '@/lib/utils'

// const Logout: React.FC = () => {
//   const handleLogout = async () => {
//     try {
//       await authApi.logout();
//       // Redirect to login page
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <button onClick={handleLogout}>Logout</button>
//   );
// };

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await authApi.verifyTwoFactor(email, twoFactorCode)
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      // Redirect to dashboard or home page
    } catch (error) {
      console.error('2FA verification error:', error)
    }
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(data)

    try {
      const response = await authApi.login(email, password)
      if (response.data.requiresTwoFactor) {
        setRequiresTwoFactor(true)
      } else {
        // Handle successful login
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        // Redirect to dashboard or home page
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        {!requiresTwoFactor ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Password</FormLabel>
                      <Link
                        to='/forgot-password'
                        className='text-muted-foreground text-sm font-medium hover:opacity-75'
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' loading={isLoading}>
                Login
              </Button>

              <div className='relative my-2'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background text-muted-foreground px-2'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  loading={isLoading}
                  leftSection={<IconBrandGithub className='h-4 w-4' />}
                >
                  GitHub
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  loading={isLoading}
                  leftSection={<IconBrandFacebook className='h-4 w-4' />}
                >
                  Facebook
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleTwoFactorVerification}>
            <input
              type='text'
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder='2FA Code'
              required
            />
            <button type='submit'>Verify</button>
          </form>
        )}
      </Form>
    </div>
  )
}
