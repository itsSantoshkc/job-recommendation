# Role
You are a senior backend engineer. Build the **backend API only** for a job portal. It serves a React frontend (TanStack Router + Query) and must match the roles and pages below. Write production-quality, typed, tested code.

# Tech stack (fixed)
- **Language:** Python 3.12, fully type-hinted
- **Framework:** FastAPI (async) with Pydantic v2
- **Database:** PostgreSQL 16, SQLAlchemy 2.0 (async, `asyncpg`), Alembic migrations
- **Recommendations:** scikit-learn `TfidfVectorizer` + `cosine_similarity` (no external APIs, no pretrained embeddings)
- **Auth:** Better Auth runs in a separate auth service (frontend side). FastAPI only **verifies** its JWTs (JWT plugin, verify via JWKS with `PyJWT`). Never store passwords in this API.
- **Tooling:** `uv` or `pip-tools`, Ruff, pytest + httpx `AsyncClient`, Docker Compose (api + postgres)

# Roles
- `user` (job seeker): browse jobs, manage resumes, apply, track applications, get recommendations
- `company`: post jobs, view dashboard stats, review applications, accept or reject
- Public (no token): list and view jobs, job count

# Auth and authorization
- Dependency `get_current_user()` decodes the Bearer JWT and reads `sub` (user id) and `role`.
- Dependency `get_optional_user()` for public endpoints.
- Dependency `require_role("user" | "company")`.
- Ownership is enforced in queries (filter by `user_id` / `company_id`). For resources the caller doesn't own, return **404**, not 403.
- CORS allowlist from env, plus rate limiting on search and recommendation endpoints.

# Database schema
Better Auth owns its tables (`user`, `session`, `account`, `verification`). Treat `user.id` (text) as the foreign key target and assume `user.role` exists via Better Auth's additional fields. Create only the application tables below via Alembic.

Tables that need to created are in docs/schema.sql

Add an `updated_at` trigger (or SQLAlchemy `onupdate`) for `jobs`. A job is "past" when `status = 'closed'` or `deadline < current_date`.

# Recommendation engine (TF-IDF + cosine similarity)
Implement as an isolated module `app/recommender/` with unit tests.

**Documents**
- Job document = `title` repeated 3x + `requirements` repeated 2x + `description` (title and requirements are stronger signals).
- Resume document = markdown stripped to plain text (remove links, code fences, and formatting symbols).

**Vectorizer config**
- `TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2), sublinear_tf=True, min_df=1, max_df=0.9)`
- Custom `token_pattern` that preserves tech tokens such as `c#`, `c++`, `.net`, `node.js`.

**Pipeline**
1. Fit the vectorizer on all **open** jobs and cache the fitted vectorizer plus the job matrix in memory (singleton service with an `asyncio.Lock`; fit in a threadpool so the event loop isn't blocked).
2. Invalidate or rebuild the cache when a job is created, updated, or closed, and also on a periodic refresh (every 10 minutes).
3. On recommendation: `vectorizer.transform([resume_text])`, then `cosine_similarity` against the job matrix.
4. Apply optional filters (location, shift, experience) and **exclude jobs the user already applied to**.
5. Drop scores below `0.05`, sort descending, return the top N (default 20).
6. Response per job: normal job fields, `match_score` (0 to 100), and `matched_keywords` (top 5 terms with the highest combined TF-IDF weight in both resume and job, for explainability).

Edge cases: empty corpus returns `[]`; resume with no overlapping vocabulary returns `[]` with a clear message; a very short resume returns a warning field.

# API endpoints (all under `/api/v1`)
Pagination shape: `{ items, total, page, page_size }`. Error shape: `{ detail, code }`.

**Public**
| Method | Path | Notes |
|---|---|---|
| GET | `/health` | liveness and DB check |
| GET | `/jobs` | `q` (Postgres full-text search on title and description via `websearch_to_tsquery`, ranked with `ts_rank`), `location`, `shift`, `experience_level`, `page`, `page_size`, `sort` (newest/relevance); open jobs only |
| GET | `/jobs/stats` | `{ open_jobs_count }` for the homepage |
| GET | `/jobs/{job_id}` | job detail with company info; includes `has_applied` if a token is present |

**User role**
| Method | Path | Notes |
|---|---|---|
| GET/POST | `/resumes` | list and create |
| GET/PUT/DELETE | `/resumes/{id}` | own resumes only |
| POST | `/jobs/{job_id}/apply` | body `{ resume_id, cover_note? }`; snapshots resume; 409 on duplicate; 400 if job closed or past deadline |
| GET | `/applications/me` | filters: `status`, `sort`; includes job and company summary |
| POST | `/recommendations` | body `{ resume_id, location?, shift?, experience_level?, limit? }` |

**Company role**
| Method | Path | Notes |
|---|---|---|
| GET/PUT | `/company/profile` | create or update profile |
| GET | `/company/dashboard` | `{ total_jobs, open_jobs, total_applications, by_status: {pending, accepted, rejected}, applications_per_job: [{job_id, title, count}], recent_applications: [...] }` |
| POST | `/company/jobs` | create (validated; triggers recommender cache invalidation) |
| PATCH | `/company/jobs/{id}` | edit own job |
| POST | `/company/jobs/{id}/close` | sets `status=closed`, `closed_at` |
| GET | `/company/jobs` | filter `status=open\|closed\|past` (powers the Past Jobs page) with application counts |
| GET | `/company/applications` | filters: `job_id`, `status`; paginated |
| GET | `/company/applications/{id}` | applicant info plus `resume_snapshot_md` |
| PATCH | `/company/applications/{id}/status` | body `{ status: "accepted" \| "rejected" }`; sets `reviewed_at`; only from `pending` |

# Project structure
```
app/
  main.py
  core/        # config, security (JWT/JWKS), deps, errors
  db/          # session, base, models/
  schemas/     # Pydantic request/response models
  routers/     # jobs, resumes, applications, recommendations, company
  services/    # business logic (no SQL in routers)
  recommender/ # text_prep.py, engine.py, cache.py
alembic/
tests/
docker-compose.yml
.env.example
```

# Requirements
- Routers thin, logic in services, SQL via SQLAlchemy only (no string-built queries).
- Use `selectinload`/joins to avoid N+1 queries on list endpoints.
- Validate all input with Pydantic (length limits, enum values, resume size cap of 100 KB).
- Seed script with a few companies, ~30 realistic jobs, and sample resumes for testing recommendations.
- Tests: recommender ranking sanity, apply flow (duplicate, closed job), authorization boundaries (company A cannot see company B's applications), status transitions.
- OpenAPI docs enabled at `/docs`, with tags and examples.

# Out of scope
Frontend, email notifications, file uploads (resumes are markdown only), embeddings or LLM-based ranking.

# Output order
1. Docker Compose, config, project skeleton
2. SQLAlchemy models and the Alembic migration
3. Auth dependencies (JWKS verification)
4. Recommender module with tests
5. Routers and services, one group at a time (public, user, company). Ask before moving to the next group.
