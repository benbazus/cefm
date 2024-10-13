import { HTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/custom/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ForgotFormProps extends HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [step, setStep] = useState(1)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(data)

    try {
      await authApi.requestPasswordReset(email)
      setStep(2)
    } catch (error) {
      console.error('Reset request error:', error)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authApi.resetPassword(resetToken, newPassword)
      // Redirect to login page or show success message
    } catch (error) {
      console.error('Password reset error:', error)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        {step === 1 ? (
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
              <Button className='mt-2' loading={isLoading}>
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input
              type='text'
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder='Reset Token'
              required
            />
            <input
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder='New Password'
              required
            />
            <button type='submit'>Reset Password</button>
          </form>
        )}
      </Form>
    </div>
  )
}
