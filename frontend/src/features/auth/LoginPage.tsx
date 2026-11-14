import { useState } from 'react'
import { useSearch, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../services/api'
import { Mail, Lock, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginPageSearch {
  redirect?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' }) as LoginPageSearch
  const { addToast } = useToast()
  const redirectTo = search.redirect || '/'

  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    try {
      await api.auth.login(data.email, data.password)
      addToast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
        variant: 'success',
      })
      navigate({ to: redirectTo, replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setSubmitError(message)
      addToast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...form.register('email')}
                  className="pl-10"
                  aria-describedby="email-error"
                />
                {form.formState.errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register('password')}
                  className="pl-10"
                  aria-describedby="password-error"
                />
                {form.formState.errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
