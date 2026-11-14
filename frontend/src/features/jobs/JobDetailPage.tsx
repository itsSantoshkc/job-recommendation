import { useParams, useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth'
import { useJob, useApply } from '../../hooks/useApi'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { JobDetailSkeleton } from '../../components/ui/Skeleton'
import { useResumes } from '../../hooks/useApi'
import { formatDate, formatRelativeTime } from '../../lib/utils'
import { MapPin, Clock, Calendar, Building2, DollarSign, Briefcase, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import type { Job } from '../../types'

function JobMeta({ job }: { job: Job }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
      <span className="flex items-center gap-1">
        <Building2 className="h-4 w-4" />
        {job.companyName}
      </span>
      <span className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        {job.location}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {job.shift.replace('-', ' ')}
      </span>
      <span className="flex items-center gap-1">
        <Briefcase className="h-4 w-4" />
        {job.experienceLevel}
      </span>
      {job.salaryRange && (
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
          <DollarSign className="h-4 w-4" />
          ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} / {job.salaryRange.period}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        Posted {formatRelativeTime(job.postedAt)}
      </span>
    </div>
  )
}

function JobSection({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
        {title}
      </h3>
      <div className="prose prose-gray dark:prose-invert max-w-none">{children}</div>
    </div>
  )
}

export function JobDetailPage() {
  const { jobId } = useParams({ from: '/jobs/$jobId' })
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { data: job, isLoading, error } = useJob(jobId)
  const { data: resumes } = useResumes()
  const applyMutation = useApply()

  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [coverNote, setCoverNote] = useState('')

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: `/jobs/${jobId}` } })
      return
    }
    if (resumes && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id)
    }
    setApplyModalOpen(true)
  }

  const handleSubmitApplication = async () => {
    if (!selectedResumeId) return
    try {
      await applyMutation.mutateAsync({
        jobId,
        resumeId: selectedResumeId,
        coverNote: coverNote || undefined,
      })
      setApplyModalOpen(false)
      setCoverNote('')
      navigate({ to: '/applications' })
    } catch (err) {
      console.error('Failed to apply:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <JobDetailSkeleton />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs</Button>
        </Link>
      </div>
    )
  }

  const hasApplied = false

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                  <Badge variant="status" status={job.status} />
                </div>
                <JobMeta job={job} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {job.salaryRange && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <DollarSign className="h-5 w-5" />
                <span>${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} / {job.salaryRange.period}</span>
              </div>
            )}

            <JobSection title="Description" icon={<Briefcase className="h-5 w-5" />}>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{job.description}</p>
            </JobSection>

            <JobSection title="Requirements" icon={<CheckCircle className="h-5 w-5" />}>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{job.requirements}</p>
            </JobSection>

            {job.deadline && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>Application deadline: {formatDate(job.deadline)}</span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {hasApplied ? (
                <Button variant="secondary" className="w-full" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Already Applied
                </Button>
              ) : (
                <Button className="w-full" onClick={handleApplyClick} disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              About {job.companyName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              {job.companyName} is hiring for this position. Visit their website for more information.
            </p>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Position"
        description="Select your resume and add an optional cover note."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Resume
            </label>
            <select
              id="resume"
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            >
              {resumes?.map(r => (
                <option key={r.id} value={r.id}>{r.name}{r.isDefault && ' (Default)'}</option>
              ))}
            </select>
            {(!resumes || resumes.length === 0) && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                No saved resumes. <Link to="/resume-builder" className="underline">Create one first</Link>.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="coverNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Note (Optional)
            </label>
            <textarea
              id="coverNote"
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
              placeholder="Why are you a good fit for this role?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitApplication} disabled={!selectedResumeId || applyMutation.isPending}>
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}