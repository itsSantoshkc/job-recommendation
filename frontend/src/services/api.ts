import type { Job, JobFilters, PaginatedResponse, Resume, Application, ApplicationStatus, User, UserRole } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    description: 'We are looking for a Senior Frontend Engineer to join our team...',
    requirements: '5+ years React, TypeScript, Tailwind CSS',
    location: 'San Francisco, CA',
    shift: 'full-time',
    experienceLevel: 'senior',
    salaryRange: { min: 150000, max: 200000, currency: 'USD', period: 'yearly' },
    companyId: 'comp1',
    companyName: 'TechCorp Inc.',
    companyLogo: 'https://via.placeholder.com/100',
    postedAt: '2024-01-15T10:00:00Z',
    status: 'active',
    applicationCount: 12,
  },
  {
    id: '2',
    title: 'Backend Developer',
    description: 'Join our backend team building scalable APIs...',
    requirements: '3+ years Node.js, PostgreSQL, AWS',
    location: 'New York, NY',
    shift: 'hybrid',
    experienceLevel: 'mid',
    salaryRange: { min: 120000, max: 160000, currency: 'USD', period: 'yearly' },
    companyId: 'comp2',
    companyName: 'DataSystems LLC',
    postedAt: '2024-01-10T10:00:00Z',
    status: 'active',
    applicationCount: 8,
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    description: 'Work on both frontend and backend...',
    requirements: '2+ years React, Node.js, MongoDB',
    location: 'Remote',
    shift: 'remote',
    experienceLevel: 'junior',
    salaryRange: { min: 80000, max: 110000, currency: 'USD', period: 'yearly' },
    companyId: 'comp3',
    companyName: 'StartupXYZ',
    postedAt: '2024-01-05T10:00:00Z',
    status: 'active',
    applicationCount: 25,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    description: 'Manage our cloud infrastructure...',
    requirements: '4+ years AWS, Kubernetes, Terraform',
    location: 'Austin, TX',
    shift: 'full-time',
    experienceLevel: 'senior',
    salaryRange: { min: 140000, max: 180000, currency: 'USD', period: 'yearly' },
    companyId: 'comp1',
    companyName: 'TechCorp Inc.',
    postedAt: '2024-01-01T10:00:00Z',
    status: 'active',
    applicationCount: 5,
  },
  {
    id: '5',
    title: 'UI/UX Designer',
    description: 'Design beautiful user interfaces...',
    requirements: '3+ years Figma, user research, prototyping',
    location: 'Seattle, WA',
    shift: 'full-time',
    experienceLevel: 'mid',
    salaryRange: { min: 100000, max: 130000, currency: 'USD', period: 'yearly' },
    companyId: 'comp4',
    companyName: 'DesignStudio',
    postedAt: '2023-12-28T10:00:00Z',
    status: 'active',
    applicationCount: 15,
  },
]

const mockResumes: Resume[] = [
  {
    id: 'res1',
    userId: 'user1',
    name: 'Software Engineer Resume',
    content: `# John Doe
**Senior Software Engineer**

john.doe@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johndoe

## Summary
Experienced Senior Software Engineer with 7+ years building scalable web applications...

## Experience
**Senior Frontend Engineer** | TechCorp Inc. | 2021-Present
- Led migration from legacy codebase to React/TypeScript
- Mentored 3 junior developers

**Frontend Developer** | StartupXYZ | 2018-2021
- Built responsive web applications using React and Redux

## Education
**BS Computer Science** | Stanford University | 2018

## Skills
- **Languages:** TypeScript, JavaScript, Python, Go
- **Frontend:** React, Next.js, Tailwind CSS, GraphQL
- **Backend:** Node.js, PostgreSQL, Redis
- **Tools:** Git, Docker, AWS, CI/CD`,
    isDefault: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'res2',
    userId: 'user1',
    name: 'Full Stack Resume',
    content: `# John Doe
**Full Stack Developer**

john.doe@email.com | (555) 123-4567

## Summary
Full stack developer with expertise in both frontend and backend technologies...

## Experience
**Full Stack Developer** | DataSystems LLC | 2020-Present
- Built and maintained REST APIs using Node.js and Express
- Developed responsive frontend with React and TypeScript

## Education
**BS Computer Science** | UC Berkeley | 2018

## Skills
- **Frontend:** React, Vue.js, TypeScript, CSS
- **Backend:** Node.js, Python, PostgreSQL, MongoDB
- **DevOps:** Docker, Kubernetes, AWS`,
    isDefault: false,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
  },
]

const mockApplications: Application[] = [
  {
    id: 'app1',
    jobId: '1',
    job: mockJobs[0],
    userId: 'user1',
    user: { id: 'user1', email: 'john@example.com', name: 'John Doe', role: 'user', createdAt: '', updatedAt: '' },
    resumeId: 'res1',
    resume: mockResumes[0],
    coverNote: 'I am very interested in this position...',
    status: 'pending',
    appliedAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'app2',
    jobId: '2',
    job: mockJobs[1],
    userId: 'user1',
    user: { id: 'user1', email: 'john@example.com', name: 'John Doe', role: 'user', createdAt: '', updatedAt: '' },
    resumeId: 'res1',
    resume: mockResumes[0],
    status: 'accepted',
    appliedAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
]

const mockUser: User = {
  id: 'user1',
  email: 'john@example.com',
  name: 'John Doe',
  role: 'user',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
}

const mockCompanyUser: User = {
  id: 'comp1',
  email: 'hr@techcorp.com',
  name: 'TechCorp HR',
  role: 'company',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
}

export const api = {
  auth: {
    async getSession(): Promise<User | null> {
      await delay(100)
      const stored = localStorage.getItem('mock_user')
      return stored ? JSON.parse(stored) : null
    },

    async login(email: string, _password: string): Promise<User> {
      await delay(500)
      if (email === 'company@example.com') {
        localStorage.setItem('mock_user', JSON.stringify(mockCompanyUser))
        return mockCompanyUser
      }
      localStorage.setItem('mock_user', JSON.stringify(mockUser))
      return mockUser
    },

    async register(data: { email: string; password: string; name: string; role: UserRole }): Promise<User> {
      await delay(500)
      const user: User = { ...mockUser, ...data, id: `user_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      localStorage.setItem('mock_user', JSON.stringify(user))
      return user
    },

    async logout(): Promise<void> {
      await delay(100)
      localStorage.removeItem('mock_user')
    },
  },

  jobs: {
    async list(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
      await delay(300)
      let filtered = [...mockJobs]

      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(j =>
          j.title.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search) ||
          j.companyName.toLowerCase().includes(search)
        )
      }

      if (filters.location) {
        filtered = filtered.filter(j => j.location.toLowerCase().includes(filters.location!.toLowerCase()))
      }

      if (filters.experienceLevel) {
        filtered = filtered.filter(j => j.experienceLevel === filters.experienceLevel)
      }

      if (filters.shift) {
        filtered = filtered.filter(j => j.shift === filters.shift)
      }

      const page = filters.page || 1
      const pageSize = filters.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      }
    },

    async get(id: string): Promise<Job | null> {
      await delay(200)
      return mockJobs.find(j => j.id === id) || null
    },

    async create(job: Omit<Job, 'id' | 'companyId' | 'companyName' | 'postedAt' | 'applicationCount' | 'status'>): Promise<Job> {
      await delay(500)
      const newJob: Job = {
        ...job,
        id: `job_${Date.now()}`,
        companyId: 'comp1',
        companyName: 'TechCorp Inc.',
        postedAt: new Date().toISOString(),
        applicationCount: 0,
        status: 'active',
      }
      mockJobs.unshift(newJob)
      return newJob
    },

    async update(id: string, data: Partial<Job>): Promise<Job> {
      await delay(500)
      const idx = mockJobs.findIndex(j => j.id === id)
      if (idx === -1) throw new Error('Job not found')
      mockJobs[idx] = { ...mockJobs[idx], ...data }
      return mockJobs[idx]
    },

    async delete(id: string): Promise<void> {
      await delay(300)
      const idx = mockJobs.findIndex(j => j.id === id)
      if (idx !== -1) mockJobs.splice(idx, 1)
    },

    async recommend(resumeId: string): Promise<Job[]> {
      await delay(500)
      const resume = mockResumes.find(r => r.id === resumeId)
      if (!resume) return []
      return mockJobs.slice(0, 3)
    },
  },

  resumes: {
    async list(): Promise<Resume[]> {
      await delay(200)
      const user = await api.auth.getSession()
      return mockResumes.filter(r => r.userId === user?.id)
    },

    async get(id: string): Promise<Resume | null> {
      await delay(200)
      return mockResumes.find(r => r.id === id) || null
    },

    async create(data: Omit<Resume, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Resume> {
      await delay(300)
      const user = await api.auth.getSession()
      const resume: Resume = {
        ...data,
        id: `res_${Date.now()}`,
        userId: user?.id || 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockResumes.push(resume)
      return resume
    },

    async update(id: string, data: Partial<Resume>): Promise<Resume> {
      await delay(300)
      const idx = mockResumes.findIndex(r => r.id === id)
      if (idx === -1) throw new Error('Resume not found')
      mockResumes[idx] = { ...mockResumes[idx], ...data, updatedAt: new Date().toISOString() }
      return mockResumes[idx]
    },

    async delete(id: string): Promise<void> {
      await delay(200)
      const idx = mockResumes.findIndex(r => r.id === id)
      if (idx !== -1) mockResumes.splice(idx, 1)
    },
  },

  applications: {
    async list(filters: { status?: ApplicationStatus; jobId?: string } = {}): Promise<Application[]> {
      await delay(300)
      const user = await api.auth.getSession()
      if (!user) return []

      let filtered = user.role === 'company'
        ? mockApplications
        : mockApplications.filter(a => a.userId === user.id)

      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status)
      }

      if (filters.jobId) {
        filtered = filtered.filter(a => a.jobId === filters.jobId)
      }

      return filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    },

    async get(id: string): Promise<Application | null> {
      await delay(200)
      return mockApplications.find(a => a.id === id) || null
    },

    async apply(data: { jobId: string; resumeId: string; coverNote?: string }): Promise<Application> {
      await delay(500)
      const user = await api.auth.getSession()
      if (!user) throw new Error('Not authenticated')

      const existing = mockApplications.find(a => a.jobId === data.jobId && a.userId === user.id)
      if (existing) throw new Error('Already applied to this job')

      const job = mockJobs.find(j => j.id === data.jobId)
      const resume = mockResumes.find(r => r.id === data.resumeId)
      if (!job || !resume) throw new Error('Job or resume not found')

      const app: Application = {
        id: `app_${Date.now()}`,
        jobId: data.jobId,
        job,
        userId: user.id,
        user,
        resumeId: data.resumeId,
        resume,
        coverNote: data.coverNote,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockApplications.unshift(app)
      job.applicationCount++
      return app
    },

    async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
      await delay(300)
      const idx = mockApplications.findIndex(a => a.id === id)
      if (idx === -1) throw new Error('Application not found')
      mockApplications[idx] = { ...mockApplications[idx], status, updatedAt: new Date().toISOString() }
      return mockApplications[idx]
    },

    async getStats(): Promise<{ total: number; pending: number; accepted: number; rejected: number }> {
      await delay(200)
      const user = await api.auth.getSession()
      if (!user || user.role !== 'company') return { total: 0, pending: 0, accepted: 0, rejected: 0 }

      const apps = mockApplications
      return {
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      }
    },

    async getApplicationsPerJob(): Promise<{ jobId: string; jobTitle: string; count: number }[]> {
      await delay(200)
      const counts = new Map<string, { title: string; count: number }>()
      mockApplications.forEach(app => {
        const existing = counts.get(app.jobId) || { title: app.job.title, count: 0 }
        existing.count++
        counts.set(app.jobId, existing)
      })
      return Array.from(counts.entries()).map(([jobId, { title, count }]) => ({ jobId, jobTitle: title, count }))
    },
  },

  company: {
    async getJobs(): Promise<Job[]> {
      await delay(200)
      return mockJobs.filter(j => j.companyId === 'comp1')
    },

    async getPastJobs(): Promise<Job[]> {
      await delay(200)
      return mockJobs.filter(j => j.companyId === 'comp1' && j.status !== 'active')
    },
  },
}