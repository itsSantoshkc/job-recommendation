import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import { api } from './services/api'
import type { User } from './types'

// Initialize router context from the mock session so route context reflects
// the signed-in user on the very first load (including direct deep links).
const initialUser = ((): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('mock_user')
    return stored ? (JSON.parse(stored) as User) : null
  } catch {
    return null
  }
})()

export const rootRoute = createRootRoute({
  component: () => (
    <html lang="en">
      <head />
      <body>
        <Outlet />
      </body>
    </html>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => import('./features/jobs/JobListPage').then(m => m.JobListPage),
})

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$jobId',
  component: () => import('./features/jobs/JobDetailPage').then(m => m.JobDetailPage),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => import('./features/auth/LoginPage').then(m => m.LoginPage),
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => import('./features/auth/RegisterPage').then(m => m.RegisterPage),
})

const resumeBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resume-builder',
  component: () => import('./features/resume/ResumeBuilderPage').then(m => m.ResumeBuilderPage),
  beforeLoad: async () => {
    const user = await api.auth.getSession()
    if (!user) throw { redirect: '/login?redirect=/resume-builder' }
    if (user.role !== 'user') throw { redirect: '/company/dashboard' }
  },
})

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/applications',
  component: () => import('./features/applications/ApplicationsPage').then(m => m.ApplicationsPage),
  beforeLoad: async () => {
    const user = await api.auth.getSession()
    if (!user) throw { redirect: '/login?redirect=/applications' }
    if (user.role !== 'user') throw { redirect: '/company/dashboard' }
  },
})

const companyRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company',
  component: () => import('./features/company/CompanyLayout').then(m => m.CompanyLayout),
  beforeLoad: async () => {
    const user = await api.auth.getSession()
    if (!user) throw { redirect: '/login?redirect=/company/dashboard' }
    if (user.role !== 'company') throw { redirect: '/' }
  },
})

const companyDashboardRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: '/dashboard',
  component: () => import('./features/company/CompanyDashboardPage').then(m => m.CompanyDashboardPage),
})

const companyNewJobRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: '/jobs/new',
  component: () => import('./features/company/CompanyNewJobPage').then(m => m.CompanyNewJobPage),
})

const companyApplicationsRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: '/applications',
  component: () => import('./features/company/CompanyApplicationsPage').then(m => m.CompanyApplicationsPage),
})

const companyApplicationDetailRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: '/applications/$applicationId',
  component: () => import('./features/company/CompanyApplicationDetailPage').then(m => m.CompanyApplicationDetailPage),
})

const companyPastJobsRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: '/jobs/past',
  component: () => import('./features/company/CompanyPastJobsPage').then(m => m.CompanyPastJobsPage),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  jobDetailRoute,
  loginRoute,
  registerRoute,
  resumeBuilderRoute,
  applicationsRoute,
  companyRootRoute.addChildren([
    companyDashboardRoute,
    companyNewJobRoute,
    companyApplicationsRoute,
    companyApplicationDetailRoute,
    companyPastJobsRoute,
  ]),
])

export const router = createRouter({ routeTree, context: { user: initialUser } })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
