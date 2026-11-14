export type UserRole = 'user' | 'company'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  title: string
  description: string
  requirements: string
  location: string
  shift: JobShift
  experienceLevel: ExperienceLevel
  salaryRange?: SalaryRange
  deadline?: string
  companyId: string
  companyName: string
  companyLogo?: string
  postedAt: string
  status: JobStatus
  applicationCount: number
}

export type JobShift = 'full-time' | 'part-time' | 'remote' | 'hybrid' | 'contract' | 'internship'
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
export type JobStatus = 'active' | 'closed' | 'draft'

export interface SalaryRange {
  min: number
  max: number
  currency: string
  period: 'hourly' | 'monthly' | 'yearly'
}

export interface Resume {
  id: string
  userId: string
  name: string
  content: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  jobId: string
  job: Job
  userId: string
  user: User
  resumeId: string
  resume: Resume
  coverNote?: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface JobFilters {
  search?: string
  location?: string
  experienceLevel?: ExperienceLevel
  shift?: JobShift
  page?: number
  pageSize?: number
}

export interface ApiError {
  message: string
  code?: string
  status: number
}