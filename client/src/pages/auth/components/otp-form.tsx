import { HTMLAttributes, useEffect, useState } from 'react'
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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PinInput, PinInputField } from '@/components/custom/pin-input'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from '@/components/ui/use-toast'
import { resendOtp } from '@/services/api'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-app-state'

interface OtpFormProps extends HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'OTP must be 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers' }),
})

export default function OtpForm({ className, ...props }: OtpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { email, password } = location.state || {}
  const [disabledBtn, setDisabledBtn] = useState(true)

  const { logInUser } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  useEffect(() => {
    if (!email) {
      navigate('/login')
    }
  }, [email, navigate])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else {
      setResendDisabled(false)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      await logInUser(email, password, values.otp)
      toast({
        title: 'Success',
        description: 'OTP verified successfully.',
        variant: 'success',
      })
      navigate('/')
    } catch (error) {
      console.error('OTP verification error:', error)
      toast({
        title: 'Error',
        description: 'Invalid OTP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendDisabled(true)
    setCountdown(60)
    try {
      await resendOtp(email)
      toast({
        title: 'OTP Resent',
        description: 'A new OTP has been sent to your email.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast({
        title: 'Error',
        description: 'Failed to resend OTP. Please try again.',
        variant: 'destructive',
      })
      setResendDisabled(false)
      setCountdown(0)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormControl>
                    <PinInput
                      {...field}
                      className='flex h-10 justify-between'
                      onComplete={() => setDisabledBtn(false)}
                      onIncomplete={() => setDisabledBtn(true)}
                    >
                      {Array.from({ length: 6 }, (_, i) => (
                        <PinInputField
                          key={i}
                          component={Input}
                          className={cn(
                            form.getFieldState('otp').invalid
                              ? 'border-red-500'
                              : ''
                          )}
                        />
                      ))}
                    </PinInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || disabledBtn}
            >
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Verify OTP
            </Button>

            <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
              Haven't received it?{' '}
              <Button
                variant='link'
                onClick={handleResendOtp}
                disabled={resendDisabled}
              >
                {resendDisabled
                  ? `Resend a new code in ${countdown}s`
                  : 'Resend a new code'}
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}
