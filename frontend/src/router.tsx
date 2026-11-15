import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";

import { api } from "./services/api";
import type { User } from "./types";

import { LoginPage } from "./features/auth/LoginPage";
import { JobListPage } from "./features/jobs/JobListPage";
import { JobDetailPage } from "./features/jobs/JobDetailPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { ResumeBuilderPage } from "./features/resume/ResumeBuilderPage";
import { ApplicationsPage } from "./features/applications/ApplicationsPage";

import { CompanyLayout } from "./features/company/CompanyLayout";
import { CompanyDashboardPage } from "./features/company/CompanyDashboardPage";
import { CompanyNewJobPage } from "./features/company/CompanyNewJobPage";
import { CompanyApplicationsPage } from "./features/company/CompanyApplicationsPage";
import { CompanyApplicationDetailPage } from "./features/company/CompanyApplicationDetailPage";
import { CompanyPastJobsPage } from "./features/company/CompanyPastJobsPage";

// Initialize router context from the mock session.
const initialUser = ((): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("mock_user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
})();

// Root route
export const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}

// Home / Job listing
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: JobListPage,
});

// Job details
const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$jobId",
  component: JobDetailPage,
});

// Authentication
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

// Resume builder
const resumeBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/resume-builder",
  component: ResumeBuilderPage,
  beforeLoad: async () => {
    const user = await api.auth.getSession();

    if (!user) {
      throw { redirect: "/login?redirect=/resume-builder" };
    }

    if (user.role !== "user") {
      throw { redirect: "/company/dashboard" };
    }
  },
});

// Applications
const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/applications",
  component: ApplicationsPage,
  beforeLoad: async () => {
    const user = await api.auth.getSession();

    if (!user) {
      throw { redirect: "/login?redirect=/applications" };
    }

    if (user.role !== "user") {
      throw { redirect: "/" };
    }
  },
});

// Company routes
const companyRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/company",
  component: CompanyLayout,
  beforeLoad: async () => {
    const user = await api.auth.getSession();

    if (!user) {
      throw { redirect: "/login?redirect=/company/dashboard" };
    }

    if (user.role !== "company") {
      throw { redirect: "/" };
    }
  },
});

const companyDashboardRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: "/dashboard",
  component: CompanyDashboardPage,
});

const companyNewJobRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: "/jobs/new",
  component: CompanyNewJobPage,
});

const companyApplicationsRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: "/applications",
  component: CompanyApplicationsPage,
});

const companyApplicationDetailRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: "/applications/$applicationId",
  component: CompanyApplicationDetailPage,
});

const companyPastJobsRoute = createRoute({
  getParentRoute: () => companyRootRoute,
  path: "/jobs/past",
  component: CompanyPastJobsPage,
});

// Route tree
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
]);

// Router
export const router = createRouter({
  routeTree,
  context: {
    user: initialUser,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
