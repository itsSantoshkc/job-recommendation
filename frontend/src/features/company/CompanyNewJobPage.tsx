import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateJob } from '../../hooks/useApi'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Label } from '../../components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { cn } from '../../lib/utils'
import { ArrowLeft, DollarSign, AlertTriangle } from 'lucide-react'
import type { JobShift, ExperienceLevel } from '../../types'

const shifts: { value: JobShift; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
]

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const
const periods = ['hourly', 'monthly', 'yearly'] as const

const newJobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters.'),
  location: z.string().min(2, 'Location is required.'),
  shift: z.enum(shifts.map(s => s.value) as unknown as [JobShift, ...JobShift[]]),
  experienceLevel: z.enum(
    experienceLevels.map(e => e.value) as unknown as [ExperienceLevel, ...ExperienceLevel[]]
  ),
  salaryMin: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || !isNaN(Number(val)), 'Enter a valid number.'),
  salaryMax: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || !isNaN(Number(val)), 'Enter a valid number.'),
  salaryCurrency: z.enum(currencies).optional(),
  salaryPeriod: z.enum(periods).optional(),
  deadline: z.string().optional(),
})

type NewJobFormData = z.infer<typeof newJobSchema>

export function CompanyNewJobPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const createJob = useCreateJob()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSalary, setShowSalary] = useState(false)

  const form = useForm<NewJobFormData>({
    resolver: zodResolver(newJobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      location: '',
      shift: 'full-time',
      experienceLevel: 'mid',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'USD',
      salaryPeriod: 'yearly',
      deadline: '',
    },
  })

  const onSubmit = async (data: NewJobFormData) => {
    setSubmitError(null)
    try {
      const salaryRange =
        data.salaryMin || data.salaryMax
          ? {
              min: Number(data.salaryMin) || 0,
              max: Number(data.salaryMax) || 0,
              currency: data.salaryCurrency || 'USD',
              period: data.salaryPeriod || 'yearly',
            }
          : undefined

      await createJob.mutateAsync({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        shift: data.shift,
        experienceLevel: data.experienceLevel,
        salaryRange,
        deadline: data.deadline || undefined,
      })

      addToast({
        title: 'Job posted!',
        description: 'Your job listing is now live.',
        variant: 'success',
      })
      navigate({ to: '/company/jobs/past', replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post job. Please try again.'
      setSubmitError(message)
      addToast({
        title: 'Failed to post job',
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/company/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Post a New Job</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Fill in the details below to publish your job listing.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Frontend Engineer"
                  {...form.register('title')}
                  aria-describedby="title-error"
                />
                {form.formState.errors.title && (
                  <p id="title-error" className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  {...form.register('location')}
                  aria-describedby="location-error"
                />
                {form.formState.errors.location && (
                  <p id="location-error" className="text-sm text-red-600 dark:text-red-400">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Work Type *</Label>
              <Select
                id="shift"
                options={shifts}
                {...form.register('shift')}
                aria-describedby="shift-error"
              />
              {form.formState.errors.shift && (
                <p id="shift-error" className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.shift.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                id="experienceLevel"
                options={experienceLevels}
                {...form.register('experienceLevel')}
                aria-describedby="experience-error"
              />
              {form.formState.errors.experienceLevel && (
                <p id="experience-error" className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.experienceLevel.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe the role, responsibilities, and what the candidate will work on..."
                {...form.register('description')}
                aria-describedby="description-error"
              />
              {form.formState.errors.description && (
                <p id="description-error" className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                rows={6}
                placeholder="List required skills, experience, and qualifications..."
                {...form.register('requirements')}
                aria-describedby="requirements-error"
              />
              {form.formState.errors.requirements && (
                <p id="requirements-error" className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.requirements.message}
                </p>
              )}
            </div>

            {/* Optional salary section */}
            <div
              className={cn(
                'border rounded-lg p-4',
                showSalary
                  ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
                  : 'border-gray-200/50 bg-transparent dark:border-gray-700/50'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setShowSalary(!showSalary)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {showSalary ? <ArrowLeft className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  {showSalary ? 'Hide salary range' : 'Add salary range (optional)'}
                </button>
              </div>
              {showSalary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Min</Label>
                    <Input
                      id="salaryMin"
                      type="text"
                      placeholder="0"
                      {...form.register('salaryMin')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Max</Label>
                    <Input
                      id="salaryMax"
                      type="text"
                      placeholder="0"
                      {...form.register('salaryMax')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select
                      id="salaryCurrency"
                      options={currencies.map(c => ({ value: c, label: c }))}
                      {...form.register('salaryCurrency')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryPeriod">Period</Label>
                    <Select
                      id="salaryPeriod"
                      options={periods.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                      {...form.register('salaryPeriod')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline (optional)</Label>
              <Input
                id="deadline"
                type="date"
                {...form.register('deadline')}
              />
              {form.formState.errors.deadline && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.deadline.message}
                </p>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
                <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="ghost" type="button" onClick={() => navigate({ to: '/company/dashboard', replace: true })}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Posting Job...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
