import { useState, useCallback } from 'react'
import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useDebouncedCallback } from 'use-debounce'
import { Search, Filter, X, Briefcase, MapPin, Clock, Brain } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { JobCardSkeleton } from '../../components/ui/Skeleton'
import { useJobs, useRecommendedJobs } from '../../hooks/useApi'
import { useAuth } from '../../lib/auth'
import { cn, formatRelativeTime } from '../../lib/utils'
import type { Job, JobFilters, ExperienceLevel, JobShift } from '../../types'

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
]

const shifts: { value: JobShift; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

function JobCard({ job }: { job: Job }) {
  return (
    <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="block">
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <Briefcase className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                <Badge variant="status" status={job.status} className="flex-shrink-0" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">{job.companyName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">{job.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.shift.replace('-', ' ')}
                </Badge>
                <Badge variant="outline">{job.experienceLevel}</Badge>
              </div>
              {job.salaryRange && (
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                  ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} / {job.salaryRange.period}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">Posted {formatRelativeTime(job.postedAt)} · {job.applicationCount} applications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function FiltersSidebar({ filters, onFiltersChange, isOpen, onClose }: {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  isOpen: boolean
  onClose: () => void
}) {
  const hasFilters = !!(filters.location || filters.experienceLevel || filters.shift)

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white p-4 shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none md:border-0 md:p-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Job filters"
      >
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close filters">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <Input
              id="location"
              placeholder="City, State, or Remote"
              value={filters.location || ''}
              onChange={e => onFiltersChange({ ...filters, location: e.target.value || undefined, page: 1 })}
            />
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Experience Level
            </label>
            <Select
              id="experience"
              options={[{ value: '', label: 'All Levels' }, ...experienceLevels]}
              value={filters.experienceLevel || ''}
              onChange={e => onFiltersChange({ ...filters, experienceLevel: e.target.value as ExperienceLevel || undefined, page: 1 })}
            />
          </div>

          <div>
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Work Type
            </label>
            <Select
              id="shift"
              options={[{ value: '', label: 'All Types' }, ...shifts]}
              value={filters.shift || ''}
              onChange={e => onFiltersChange({ ...filters, shift: e.target.value as JobShift || undefined, page: 1 })}
            />
          </div>

          {hasFilters && (
            <Button variant="outline" className="w-full" onClick={() => onFiltersChange({ page: 1 })}>
              Clear all filters
            </Button>
          )}
        </div>
      </aside>
    </>
  )
}

function RecommendModal({ isOpen, onClose, onSelectResume, resumes }: {
  isOpen: boolean
  onClose: () => void
  onSelectResume: (resumeId: string) => void
  resumes: { id: string; name: string }[]
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Get Job Recommendations"
      description="Select a resume to get personalized job recommendations based on your skills and experience."
    >
      <div className="space-y-3">
        {resumes.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No saved resumes found.</p>
            <Button variant="outline" className="mt-4" onClick={() => { onClose(); window.location.href = '/resume-builder'; }}>
              Create Resume
            </Button>
          </div>
        ) : (
          resumes.map(resume => (
            <Button
              key={resume.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => { onSelectResume(resume.id); onClose(); }}
            >
              {resume.name}
            </Button>
          ))
        )}
      </div>
    </Modal>
  )
}

export function JobListPage() {
  const { isAuthenticated } = useAuth()
  const search = useSearch({ from: '/' }) as {
    q?: string
    location?: string
    experience?: string
    shift?: string
    page?: string
  }
  const navigate = useNavigate()
  const [filters, setFilters] = useState<JobFilters>({
    search: search.q,
    location: search.location,
    experienceLevel: search.experience as ExperienceLevel,
    shift: search.shift as JobShift,
    page: search.page ? parseInt(search.page as string) : 1,
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [recommendModalOpen, setRecommendModalOpen] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)

  const { data: jobsData, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useJobs(filters)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }))
  }, 300)

  const handleSearchChange = (value: string) => {
    debouncedSearch(value)
    navigate({ to: '/', search: { ...search, q: value || undefined, page: 1 }, replace: true })
  }

  const handleFilterChange = useCallback((newFilters: JobFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    navigate({
      to: '/',
      search: {
        ...search,
        q: newFilters.search,
        location: newFilters.location,
        experience: newFilters.experienceLevel,
        shift: newFilters.shift,
        page: newFilters.page?.toString(),
      },
      replace: true,
    })
  }, [search, navigate])

  const handleRecommendClick = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login', search: { redirect: '/' } })
      return
    }
    setRecommendModalOpen(true)
  }

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId)
  }

  const { data: recommendedJobs } = useRecommendedJobs(selectedResumeId || '', !!selectedResumeId)

  const allJobs: Job[] =
    recommendedJobs && recommendedJobs.length > 0
      ? recommendedJobs
      : jobsData?.pages?.[0]?.data || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Next Job</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Search {jobsData?.pages?.[0]?.total ?? 0} available positions
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search by title, company, or keyword..."
              value={filters.search || ''}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-10"
              aria-label="Job search"
            />
          </div>
          <Button variant="outline" onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="secondary" onClick={handleRecommendClick} className="hidden sm:flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Recommend for me
          </Button>
        </div>

        <div className="flex gap-8">
          <FiltersSidebar
            filters={filters}
            onFiltersChange={handleFilterChange}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1">
            {recommendedJobs && recommendedJobs.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                  <Brain className="h-5 w-5" />
                  <span className="font-medium">Recommended for you</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Based on your selected resume, here are personalized job matches.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => <JobCardSkeleton key={i} />)}
              </div>
            ) : allJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilters({ page: 1 })}>Clear filters</Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allJobs.map(job => <JobCard key={job.id} job={job} />)}
                </div>

                {hasNextPage && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="w-full sm:w-auto"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More Jobs'}
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="mt-8 text-center text-red-500">
                    <p>Failed to load jobs. Please try again.</p>
                    <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <RecommendModal
        isOpen={recommendModalOpen}
        onClose={() => { setRecommendModalOpen(false); setSelectedResumeId(null) }}
        onSelectResume={handleResumeSelect}
        resumes={[]}
      />
    </div>
  )
}