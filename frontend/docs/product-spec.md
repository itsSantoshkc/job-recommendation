# Role
You are a senior frontend engineer. Build the **frontend only** of a job portal web app. Assume a separate REST backend exists; mock API calls behind a typed service layer so the backend can be swapped in later.

# Tech stack (fixed)
- **Language:** TypeScript (strict mode)
- **Auth:** Better Auth (client SDK), session-based, with role support (`user` | `company`)
- **Routing:** TanStack Router (file-based routes, `beforeLoad` guards for protected routes)
- **Data fetching:** TanStack Query (query keys per resource, mutations with cache invalidation, optimistic updates for accept/reject)
- **Styling:** Tailwind CSS (mobile-first, responsive, dark mode optional)
- **Forms:** React Hook Form + Zod validation
- **Resume:** `react-markdown` (+ `remark-gfm`) for preview; PDF export via `html2pdf.js` or `react-to-print`

# Roles

## 1. User (job seeker)

### Public (no auth required)
- `/` Home: hero, search bar, list of available jobs, total job count.
  - Search by job title and description (debounced, synced to URL search params).
  - Filters: location, experience level, shift (full-time/part-time/remote/etc.), shown in a sidebar or drawer on mobile. Filters persist in the URL.
  - "Recommend for me" button: opens a modal to select one of the user's saved resumes, then shows recommended jobs based on it. If not logged in, prompt login first.
- `/jobs/$jobId` Job details: title, company, description, requirements, location, shift, experience, posted date, **Apply** button.
  - If unauthenticated, **Apply** redirects to `/register?redirect=/jobs/$jobId`, and returns the user to the job after signup/login.

### Authenticated
- `/login`, `/register` (Better Auth; register includes a role choice or separate company signup).
- **Apply flow:** select a saved resume (or go create one), optional cover note, submit. Prevent duplicate applications.
- `/resume-builder`: split-pane page.
  - Left: markdown editor (with a starter template and a basic toolbar).
  - Right: live preview styled as an A4 document.
  - Actions: **Save** (create/update, named resumes), **Export PDF**, list/load/delete saved resumes.
  - Unsaved-changes warning on navigation.
- `/applications` History: table/cards of past applications with job, company, applied date and status badge (`pending` | `accepted` | `rejected`). Filter by status and sort by date.

## 2. Company / Admin
All routes under `/company/*`, guarded by role `company`. Layout with a navbar (links: Dashboard, New Job, Applications, Past Jobs); **default route is Dashboard**.

- `/company/dashboard`: **bento-grid** layout with stat cards: total jobs posted, total applications received, pending/accepted/rejected counts, applications-per-job chart, and recent applications list.
- `/company/jobs/new`: form with title, description, requirements, location, shift, required experience (plus optional salary range and deadline). Zod validation, success toast, redirect to the job list.
- `/company/applications`: all applications across posted jobs, filterable by job and status.
  - `/company/applications/$applicationId`: applicant details, rendered resume (markdown), and **Accept** / **Reject** buttons that update the status.
- `/company/jobs/past`: closed or previously posted jobs with their application counts.

# Pages summary
| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Job list, search, filters, recommendations |
| `/jobs/$jobId` | Public | Job details and apply |
| `/login`, `/register` | Public | Auth |
| `/resume-builder` | User | Create, save, export resume |
| `/applications` | User | Application history |
| `/company/dashboard` | Company | Stats overview |
| `/company/jobs/new` | Company | Post a job |
| `/company/applications` (+ `/$id`) | Company | Review, accept, reject |
| `/company/jobs/past` | Company | Past postings |

# Requirements
- Route guards: redirect unauthenticated users to login, and users on the wrong role to their own home.
- Every data view has **loading (skeletons), empty, and error states**.
- Accessible (labels, focus states, keyboard navigation) and fully responsive.
- Shared TypeScript types: `Job`, `Resume`, `Application`, `User`, `ApplicationStatus`.

# Suggested structure
```
src/
  routes/          # TanStack Router file routes
  features/        # jobs, resume, applications, company
  components/ui/   # reusable primitives
  lib/             # auth client, query client, api client
  services/        # typed API functions (mockable)
  types/
```

# Out of scope
Backend, database, payments, real recommendation algorithm (use a mock endpoint or simple keyword matching).

# Output
1. Folder structure
2. Core setup (auth client, router, query client)
3. Then each page, one at a time, with complete code. Ask before moving to the next page.
