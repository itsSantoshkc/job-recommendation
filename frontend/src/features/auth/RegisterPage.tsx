import { useState } from 'react'
import { useSearch, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { api } from '../../services/api'
import { Mail, Lock, User, Briefcase, AlertCircle } from 'lucide-react'
import type { UserRole } from '../../types'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  role: z.enum(['user', 'company'] as const),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterPageSearch {
  redirect?: string
}

const roleOptions = [
  { value: 'user' as const, label: 'Job Seeker', icon: User },
  { value: 'company' as const, label: 'Company / Recruiter', icon: Briefcase },
] as const

export function RegisterPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/register' }) as RegisterPageSearch
  const { addToast } = useToast()
  const redirectTo = search.redirect || '/'

  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '', role: 'user' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null)
    try {
      await api.auth.register({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as UserRole,
      })
      addToast({
        title: 'Account created',
        description: 'You have been registered successfully. Please sign in.',
        variant: 'success',
      })
      navigate({ to: '/login', search: { redirect: redirectTo }, replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setSubmitError(message)
      addToast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join JobPortal to apply for jobs and manage your applications.
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
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
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters
                </p>
                {form.formState.errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...form.register('name')}
                  className="pl-10"
                  aria-describedby="name-error"
                />
                {form.formState.errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select
                id="role"
                options={roleOptions.map(o => ({ value: o.value, label: o.label }))}
                value={form.watch('role') ?? ''}
                onChange={e => form.setValue('role', e.target.value as UserRole)}
                aria-describedby="role-help"
              />
              <p id="role-help" className="text-xs text-gray-500 dark:text-gray-400">
                Job seekers can apply to jobs and build resumes. Companies can post jobs and review applications.
              </p>
              {form.formState.errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              search={{ redirect: redirectTo }}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
