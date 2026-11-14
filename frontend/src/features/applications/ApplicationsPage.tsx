import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useApplications } from '../../hooks/useApi'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn, formatRelativeTime } from '../../lib/utils'
import { Clock, Briefcase, Mail, AlertTriangle } from 'lucide-react'
import type { ApplicationStatus } from '../../types'

const statusOptions: { value: ApplicationStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: applications, isLoading, error } = useApplications({
    status: statusFilter || undefined,
  })

  const sortedApplications = useMemo(() => {
    if (!applications) return []
    return [...applications].sort(
      (a, b) =>
        (sortDirection === 'desc' ? -1 : 1) *
        (new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    )
  }, [applications, sortDirection])

  const handleSortToggle = () => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Applications</h1>
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Applications</h1>
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track the status of your job applications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select
            value={statusFilter}
            options={statusOptions}
            onChange={e => setStatusFilter(e.target.value as ApplicationStatus)}
            aria-label="Filter applications by status"
          />
          <Button variant="outline" onClick={handleSortToggle} aria-label="Sort applications by date">
            {sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
            <Clock className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {sortedApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {statusFilter ? 'No applications with this status' : 'No applications yet'}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {statusFilter
              ? 'Try adjusting your filter to see more applications.'
              : "You haven't applied to any jobs yet."}
          </p>
          {!statusFilter && (
            <div className="mt-4">
              <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Browse jobs
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedApplications.map(app => (
            <Card
              key={app.id}
              className={cn(
                'group',
                app.status === 'accepted'
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-gray-200 dark:border-gray-700',
                app.status === 'accepted' ? 'bg-green-50 dark:bg-green-900/10' : ''
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:items-center mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {app.job.title}
                      </h3>
                      <Badge variant="status" status={app.status}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
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
                      to="/jobs/$jobId"
                      params={{ jobId: app.jobId }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View job
                    </Link>
                    {app.status === 'pending' && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Awaiting review
                      </span>
                    )}
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
