import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useCompanyJobs, useApplicationStats, useApplicationsPerJob, useApplications } from '../../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn, formatRelativeTime } from '../../lib/utils'
import { Briefcase, Clock, Mail, Users, TrendingUp, BarChart3, Plus } from 'lucide-react'

const statColors: Record<string, string> = {
  total: 'bg-blue-500',
  pending: 'bg-yellow-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
}

export function CompanyDashboardPage() {
  const { data: jobs = [], isLoading: jobsLoading } = useCompanyJobs()
  const { data: stats, isLoading: statsLoading } = useApplicationStats()
  const { data: perJob = [], isLoading: perJobLoading } = useApplicationsPerJob()
  const { data: recentApps = [], isLoading: appsLoading, error } = useApplications()

  const isLoading = jobsLoading || statsLoading || perJobLoading || appsLoading

  const totalJobs = jobs.length
  const totalApplications = stats?.total ?? 0
  const pendingCount = stats?.pending ?? 0
  const acceptedCount = stats?.accepted ?? 0
  const rejectedCount = stats?.rejected ?? 0

  const chartMax = useMemo(() => {
    const max = Math.max(0, ...perJob.map(p => p.count))
    return max === 0 ? 1 : max
  }, [perJob])

  const recentApplications = useMemo(() => {
    return [...recentApps]
      .sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      )
      .slice(0, 5)
  }, [recentApps])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        <DashboardSkeletonWrapper />
        <RecentAppsSkeletonWrapper />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        <p className="text-red-600 dark:text-red-400 mb-4">
          Failed to load dashboard data. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your job postings and applications
          </p>
        </div>
        <Link to="/company/jobs/new" className="flex items-center gap-2">
          <Button>Post a New Job</Button>
        </Link>
      </div>

      {/* Bento grid of stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total jobs - spans 2 on md */}
        <Card className="md:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Jobs Posted
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalJobs}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Active and closed job postings
          </p>
        </Card>

        {/* Total applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Applications
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalApplications}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Across all posted jobs
          </p>
        </Card>

        {/* Pending */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {pendingCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Applications awaiting review
          </p>
        </Card>

        {/* Accepted */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Accepted
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {acceptedCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Applications accepted
          </p>
        </Card>

        {/* Rejected */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejected
              </p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {rejectedCount}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Applications rejected
          </p>
        </Card>

        {/* Applications per job chart */}
        <Card className="md:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Applications per Job
            </h3>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-end gap-2 h-48">
            {perJob.map(item => {
              const height = Math.max(10, (item.count / chartMax) * 100)
              return (
                <div
                  key={item.jobId}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      'w-full rounded-t transition-colors duration-500',
                      statColors[item.jobId.charAt(0)] || 'bg-gray-400'
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-[120px] text-left rotate-[-45deg] origin-bottom-left">
                    {item.jobTitle}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              )
            })}
          </div>
          {perJob.length === 0 && (
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              No application data yet
            </div>
          )}
        </Card>
      </div>

      {/* Recent applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No recent applications.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentApplications.map(app => (
                  <div key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Applied to <strong>{app.job.title}</strong>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(app.appliedAt)}
                        </p>
                      </div>
                      <Badge variant="status" status={app.status}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Link
              to="/company/jobs/new"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Link>
            <Link
              to="/company/applications"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Review Applications
            </Link>
            <Link
              to="/company/jobs/past"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              View Past Jobs
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeletonWrapper() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4, 5].map(i => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-1/3 mb-4" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/4" />
        </Card>
      ))}
    </div>
  )
}

function RecentAppsSkeletonWrapper() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 h-64">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </Card>
      <Card className="lg:col-span-1 h-64">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
          ))}
        </div>
      </Card>
    </div>
  )
}
