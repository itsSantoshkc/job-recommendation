import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useApplications, useCompanyJobs } from '../../hooks/useApi'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Label } from '../../components/ui/Label'

import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn, formatRelativeTime } from '../../lib/utils'
import { Clock, Briefcase, Mail, Filter, ArrowLeft } from 'lucide-react'
import type { ApplicationStatus } from '../../types'

export function CompanyApplicationsPage() {
  const { data: jobs = [] } = useCompanyJobs()
  const { data: applications = [], isLoading, error } = useApplications()
  const [jobFilter, setJobFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('')

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (jobFilter && app.jobId !== jobFilter) return false
      if (statusFilter && app.status !== statusFilter) return false
      return true
    })
  }, [applications, jobFilter, statusFilter])

  const jobOptions = jobs.map(job => ({ value: job.id, label: job.title }))

  const statusOptions: { value: ApplicationStatus | ''; label: string }[] = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ]

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Applications</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-4">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Applications</h1>
        <p className="text-red-600 dark:text-red-400 mb-4">
          Failed to load applications. Please try again.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage applications across your job postings
          </p>
        </div>
        <Link to="/company/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 sm:w-64">
            <Label>Filter by Job</Label>
            <Select
              value={jobFilter}
              options={[{ value: '', label: 'All Jobs' }, ...jobOptions]}
              onChange={e => setJobFilter(e.target.value)}
              aria-label="Filter applications by job"
            />
          </div>
          <div className="flex-1 sm:w-64">
            <Label>Filter by Status</Label>
            <Select
              value={statusFilter}
              options={statusOptions}
              onChange={e => setStatusFilter(e.target.value as ApplicationStatus)}
              aria-label="Filter applications by status"
            />
          </div>
          <div className="flex-1 sm:w-auto">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {filteredApplications.length} application(s)
            </p>
          </div>
        </div>
      </Card>

      {filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Filter className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No matching applications
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Try adjusting your filters to see more applications.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map(app => (
            <Card
              key={app.id}
              className={cn(
                'group',
                app.status === 'pending'
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:items-center mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {app.user.name}
                      </h3>
                      <Badge variant="status" status={app.status}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Applied to <strong>{app.job.title}</strong>{' · '}
                      {app.job.companyName}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {formatRelativeTime(app.appliedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {app.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {app.job.shift.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/company/applications/$applicationId"
                      params={{ applicationId: app.id }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
