# Job Portal: Project Rules

Monorepo for a job portal.

- `frontend/`: React + TypeScript, TanStack Router and Query, Better Auth client, Tailwind CSS
- `backend/`: FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, TF-IDF + cosine similarity recommender
- Roles: `user` (job seeker) and `company`

These rules apply to every task. Follow them without being reminded.

## Repository layout

```
.
├── CLAUDE.md
├── .env.example          # committed, placeholders only
├── .env                  # local secrets, NEVER committed
├── compose.yaml          # Podman Compose: postgres + api
├── docs/                 # product spec, schema, recommender notes
├── frontend/             # pnpm project
└── backend/              # uv project
```

## Git workflow (mandatory)

**Never commit directly to `main`.** Every piece of work follows this flow:

1. **Branch first.** Before editing any file, run `git status` and `git switch main && git pull`, then create a branch:
   `git switch -c <type>/<short-description>`
   Types: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/` (e.g. `feat/resume-builder`).
2. **Make the changes** on that branch only.
3. **Verify before committing:** run lint, type-check, and tests for every part you touched (see Commands).
4. **Commit in small, logical steps** using Conventional Commits:
   `feat(backend): add recommendation endpoint`, `fix(frontend): redirect after login`.
5. **Push the branch to GitHub:** `git push -u origin <branch>`.
6. **Open a pull request** with `gh pr create` if the GitHub CLI is available. Give it a clear title and a short description of what changed and how it was tested.
7. **Stop there.** Do not merge into `main` and do not delete branches unless the user explicitly asks.

Rules:
- If already on a feature branch for the same task, keep using it. Start a new branch for unrelated work.
- Never force-push (`--force`) and never rewrite history that has been pushed.
- Never use `git add .` blindly. Check `git status` and stage intended files only, and make sure no secrets or build artifacts are included.
- If the working tree has unrelated uncommitted changes, tell the user before proceeding.

## Containers: Podman only

Use **Podman**, never Docker. Do not run `docker` or `docker-compose` commands and do not suggest installing Docker.

- Run containers with `podman run ...` and compose stacks with `podman compose up -d` / `podman compose down`.
- Name container build files `Containerfile` and the compose file `compose.yaml`.
- Always use **fully qualified image names**, e.g. `docker.io/library/postgres:16`, because Podman does not assume a default registry.
- Run rootless. On SELinux systems, add `:Z` to bind mounts and volumes where needed.
- Read configuration from `.env` through `env_file` or `${VAR}` interpolation. Never hard-code credentials in `compose.yaml` or a `Containerfile`.
- Use named volumes for Postgres data and add a healthcheck so the API waits for the database.

## Secrets and environment variables

- All secrets and configuration live in `.env` (gitignored). **Never commit `.env`, never print its values, and never paste secrets into code, logs, commits, or PR text.**
- Keep a committed **`.env.example`** at the repo root with **every** variable the project needs, using placeholder values only (never real credentials).
- **Whenever you add, rename, or remove an environment variable, update `.env.example` in the same commit.**
- Load config in code through typed settings (`pydantic-settings` in the backend, `import.meta.env` in the frontend). No reading raw env vars scattered through the codebase.
- Frontend variables exposed to the browser must be prefixed `VITE_` and must never hold secrets.
- Make sure `.gitignore` contains `.env`, `.env.*` (except `.env.example`), `node_modules/`, `.venv/`, `__pycache__/`, `dist/`.

## Frontend (`frontend/`): pnpm only

Use **pnpm**. Never use `npm` or `yarn`, and never commit `package-lock.json` or `yarn.lock`.

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Add a package | `pnpm add <pkg>` (dev: `pnpm add -D <pkg>`) |
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |
| Type-check | `pnpm exec tsc --noEmit` |
| Test | `pnpm test` |

Conventions:
- TypeScript strict mode. No `any` unless unavoidable and commented.
- Routing with TanStack Router (file-based, route guards in `beforeLoad`). Server state with TanStack Query. Styling with Tailwind utility classes.
- Forms with React Hook Form + Zod.
- Keep API calls in a typed service layer (`src/services/`). Components do not call `fetch` directly.
- Commit `pnpm-lock.yaml`.

## Backend (`backend/`): uv only

Use **uv**. Never use `pip`, `pip install`, `poetry`, or manual `python -m venv`.

| Task | Command |
|---|---|
| Install dependencies | `uv sync` |
| Add a package | `uv add <pkg>` (dev: `uv add --dev <pkg>`) |
| Run dev server | `uv run fastapi dev app/main.py` |
| Run any command | `uv run <command>` |
| Lint / format | `uv run ruff check .` and `uv run ruff format .` |
| Test | `uv run pytest` |
| Create migration | `uv run alembic revision --autogenerate -m "<message>"` |
| Apply migrations | `uv run alembic upgrade head` |

Conventions:
- Python 3.12, fully type-hinted, async SQLAlchemy 2.0 with `asyncpg`.
- Routers stay thin. Business logic goes in `services/`. No raw string-built SQL.
- Schema changes go through Alembic migrations only. Never edit the database by hand or modify an applied migration.
- Better Auth issues the JWTs. FastAPI only **verifies** them (JWKS) and never stores passwords.
- Authorization is enforced in queries. Return 404 (not 403) for resources the caller does not own.
- Recommendation engine lives in `app/recommender/` (scikit-learn TF-IDF + cosine similarity). Invalidate its cache whenever jobs are created, updated, or closed.
- Commit `uv.lock` and `pyproject.toml`.

## Definition of done

Before pushing a branch, confirm:
- [ ] Work is on a feature branch, not `main`
- [ ] Lint, type-check, and tests pass for the touched part(s)
- [ ] `.env.example` is updated if configuration changed
- [ ] Migrations are included if the schema changed
- [ ] No secrets, `.env` files, or build artifacts are staged
- [ ] Branch is pushed to GitHub and a PR is opened

