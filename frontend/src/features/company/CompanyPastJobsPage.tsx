import { Link } from '@tanstack/react-router'
import { useCompanyPastJobs } from '../../hooks/useApi'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatRelativeTime } from '../../lib/utils'
import { Briefcase, Clock, ArrowLeft } from 'lucide-react'

export function CompanyPastJobsPage() {
  const { data: jobs = [], isLoading, error } = useCompanyPastJobs()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past Jobs</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded" variant="circular" />
                <Skeleton className="h-6 w-20 rounded" variant="circular" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past Jobs</h1>
        <p className="text-red-600 dark:text-red-400 mb-4">
          Failed to load past jobs. Please try again.
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Past Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Previously posted or closed job listings
          </p>
        </div>
        <Link to="/company/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No past jobs</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            You haven't posted any jobs yet, or all your jobs are still active.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <Card key={job.id} className="h-full flex flex-col">
              <CardContent className="p-6 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {job.title}
                  </h3>
                  <Badge variant="status" status={job.status} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Clock className="h-3 w-3" />
                    {job.shift.replace('-', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    {job.experienceLevel}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    {job.location}
                  </span>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {job.applicationCount} applications
                    </span>
                    <Link
                      to="/jobs/$jobId"
                      params={{ jobId: job.id }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      View
                    </Link>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Posted {formatRelativeTime(job.postedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
