import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import useAuth from '@/hooks/use-auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(7, { message: 'Password must be at least 7 characters long' }),
})

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const { logIn } = useAuth()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    try {
      await logIn(data.email, data.password, '', callbackUrl)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to login. Please check your credentials.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className='container grid h-svh flex-col items-center justify-center bg-primary-foreground  '>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>
        <Card className='p-6'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='item-center text-2xl font-semibold tracking-tight'>
              Login
            </h1>
            <p className='text-sm text-xs text-muted-foreground'>
              Enter your email and password below to log into your account
            </p>
          </div>

          <div className={cn('grid gap-6', className)} {...props}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='m@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={isPasswordShown ? 'text' : 'password'}
                            placeholder='Enter your password'
                            {...field}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                            onClick={() => setIsPasswordShown(!isPasswordShown)}
                          >
                            {isPasswordShown ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex items-center justify-between'>
                  <FormField
                    name='rememberMe'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button variant='link' asChild>
                    <Link to='/forgot-password'>Forgot password?</Link>
                  </Button>
                </div>

                <Button className='w-full' type='submit' disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Sign In
                </Button>
              </form>
            </Form>
          </div>

          <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Link
              to='/register'
              className='underline underline-offset-4 hover:text-primary'
            >
              Sign up
            </Link>
            .
          </p>

          <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
            By clicking login, you agree to our{' '}
            <button
              onClick={() => openInNewTab('/tos/terms')}
              className='button-link'
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              onClick={() => openInNewTab('/tos/privacy')}
              className='button-link'
            >
              Privacy Policy
            </button>
            .
          </p>
        </Card>
      </div>
    </div>
  )
}
