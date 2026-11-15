import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../lib/queryClient'
import type { Job, JobFilters, Application, ApplicationStatus, Resume } from '../types'

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => api.jobs.list(filters),
    placeholderData: (prev) => prev,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => api.jobs.get(id),
    enabled: !!id,
  })
}

export function useRecommendedJobs(resumeId: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.jobs.recommend(resumeId),
    queryFn: () => api.jobs.recommend(resumeId),
    enabled: enabled && !!resumeId,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.jobs.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      qc.invalidateQueries({ queryKey: queryKeys.company.jobs() })
    },
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) => api.jobs.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      qc.invalidateQueries({ queryKey: queryKeys.company.jobs() })
    },
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.jobs.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all })
      qc.invalidateQueries({ queryKey: queryKeys.company.jobs() })
    },
  })
}

export function useResumes() {
  return useQuery({
    queryKey: queryKeys.resumes.list(),
    queryFn: api.resumes.list,
  })
}

export function useResume(id: string) {
  return useQuery({
    queryKey: queryKeys.resumes.detail(id),
    queryFn: () => api.resumes.get(id),
    enabled: !!id,
  })
}

export function useCreateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.resumes.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export function useUpdateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resume> }) => api.resumes.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.resumes.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.resumes.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export function useApplications(filters?: { status?: ApplicationStatus; jobId?: string }) {
  return useQuery({
    queryKey: queryKeys.applications.list(filters),
    queryFn: () => api.applications.list(filters),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: () => api.applications.get(id),
    enabled: !!id,
  })
}

export function useApply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.applications.apply,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.applications.all })
      qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(variables.jobId) })
    },
  })
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => api.applications.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.applications.detail(id) })
      const previous = qc.getQueryData(queryKeys.applications.detail(id))
      qc.setQueryData(queryKeys.applications.detail(id), (old: Application | undefined) =>
        old ? { ...old, status, updatedAt: new Date().toISOString() } : old
      )
      return { previous }
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.applications.detail(id), context.previous)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.applications.all })
      qc.invalidateQueries({ queryKey: queryKeys.applications.stats() })
    },
  })
}

export function useApplicationStats() {
  return useQuery({
    queryKey: queryKeys.applications.stats(),
    queryFn: api.applications.getStats,
  })
}

export function useApplicationsPerJob() {
  return useQuery({
    queryKey: queryKeys.applications.perJob(),
    queryFn: api.applications.getApplicationsPerJob,
  })
}

export function useCompanyJobs() {
  return useQuery({
    queryKey: queryKeys.company.jobs(),
    queryFn: api.company.getJobs,
  })
}

export function useCompanyPastJobs() {
  return useQuery({
    queryKey: queryKeys.company.pastJobs(),
    queryFn: api.company.getPastJobs,
  })
}