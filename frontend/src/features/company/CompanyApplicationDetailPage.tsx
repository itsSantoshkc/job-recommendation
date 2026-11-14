import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { useApplication, useUpdateApplicationStatus } from '../../hooks/useApi'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatRelativeTime } from '../../lib/utils'
import { User, ArrowLeft, CheckCircle2, X as XIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ApplicationStatus } from '../../types'

export function CompanyApplicationDetailPage() {
  const { applicationId } = useParams({ from: '/company/applications/$applicationId' })
  const routerNavigate = useNavigate()
  const { addToast } = useToast()
  const { data: application, isLoading, error } = useApplication(applicationId)
  const updateStatus = useUpdateApplicationStatus()
  const [confirmStatus, setConfirmStatus] = useState<ApplicationStatus | null>(null)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Application Details</h1>
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Application Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The application you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/company/applications" className="inline-flex items-center gap-1">
          <Button variant="outline">Back to Applications</Button>
        </Link>
      </div>
    )
  }

  const handleAccept = () => {
    setConfirmStatus('accepted')
  }

  const handleReject = () => {
    setConfirmStatus('rejected')
  }

  const handleCancel = () => {
    setConfirmStatus(null)
  }

  const handleConfirm = async (status: ApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({ id: application.id, status })
      addToast({
        title: `Application ${status}`,
        description: `You have ${status} this application.`,
        variant: status === 'accepted' ? 'success' : 'destructive',
      })
      setConfirmStatus(null)
      routerNavigate({ to: '/company/applications', replace: true })
    } catch (err) {
      addToast({
        title: 'Failed to update status',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
      setConfirmStatus(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/company/applications" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Application header + status actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {application.user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {application.user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Job
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {application.job.title}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {application.job.companyName}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applied At
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatRelativeTime(application.appliedAt)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {application.job.location}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shift
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {application.job.shift.replace('-', ' ')}
                </p>
              </div>

              {application.coverNote && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cover Note
                  </p>
                  <div className="prose prose-gray dark:prose-invert text-sm max-w-none">
                    {application.coverNote}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status actions */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge
                variant="status"
                status={application.status}
                className="mb-1"
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>

              {application.status === 'pending' ? (
                <>
                  <Button
                    onClick={handleAccept}
                    disabled={updateStatus.isPending}
                    className="w-full bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500"
                  >
                    {updateStatus.isPending ? 'Accepting...' : <><CheckCircle2 className="h-4 w-4 mr-2" />Accept</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={updateStatus.isPending}
                    className="w-full"
                  >
                    {updateStatus.isPending ? 'Rejecting...' : <><XIcon className="h-4 w-4 mr-2" />Reject</>}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" disabled className="w-full text-gray-400">
                  Already {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Resume preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resume</CardTitle>
                <Link
                  to="/jobs/$jobId"
                  params={{ jobId: application.jobId }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Job
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] overflow-auto p-6 bg-white dark:bg-gray-900 rounded-b-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-3 text-gray-700 dark:text-gray-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-3 text-gray-700 dark:text-gray-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1 text-gray-700 dark:text-gray-300">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                        {children}
                      </code>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
                  }}
                >
                  {application.resume.content || '# (no resume content)'}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {confirmStatus === 'accepted' ? 'Accept Application' : 'Reject Application'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {confirmStatus} this application for{" "}
              <strong>{application.user.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCancel} disabled={updateStatus.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => handleConfirm(confirmStatus)}
                disabled={updateStatus.isPending}
                variant={confirmStatus === 'accepted' ? 'primary' : 'destructive'}
              >
                {updateStatus.isPending ? 'Processing...' : `Confirm ${confirmStatus}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
