import { QueryClient } from '@tanstack/react-query'
import type { JobFilters } from '../types'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    list: (filters: JobFilters) => ['jobs', 'list', filters] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    recommend: (resumeId: string) => ['jobs', 'recommend', resumeId] as const,
  },
  resumes: {
    all: ['resumes'] as const,
    list: () => ['resumes', 'list'] as const,
    detail: (id: string) => ['resumes', 'detail', id] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: (filters?: Record<string, unknown>) => ['applications', 'list', filters] as const,
    detail: (id: string) => ['applications', 'detail', id] as const,
    stats: () => ['applications', 'stats'] as const,
    perJob: () => ['applications', 'perJob'] as const,
  },
  company: {
    jobs: () => ['company', 'jobs'] as const,
    pastJobs: () => ['company', 'pastJobs'] as const,
  },
  auth: {
    session: ['auth', 'session'] as const,
  },
}