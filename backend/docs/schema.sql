CREATE TYPE job_status         AS ENUM ('open', 'closed');
CREATE TYPE shift_type         AS ENUM ('full_time', 'part_time', 'remote', 'hybrid', 'internship', 'contract');
CREATE TYPE experience_level   AS ENUM ('entry', 'junior', 'mid', 'senior');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE company_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  website     TEXT,
  location    TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL,
  requirements          TEXT NOT NULL,
  location              TEXT NOT NULL,
  shift                 shift_type NOT NULL,
  experience_level      experience_level NOT NULL,
  experience_years_min  SMALLINT NOT NULL DEFAULT 0 CHECK (experience_years_min >= 0),
  salary_min            INTEGER CHECK (salary_min >= 0),
  salary_max            INTEGER CHECK (salary_max >= salary_min),
  deadline              DATE,
  status                job_status NOT NULL DEFAULT 'open',
  search_vector         TSVECTOR GENERATED ALWAYS AS (
                          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                          setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
                          setweight(to_tsvector('english', coalesce(requirements, '')), 'C')
                        ) STORED,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at             TIMESTAMPTZ
);
CREATE INDEX idx_jobs_search     ON jobs USING GIN (search_vector);
CREATE INDEX idx_jobs_status     ON jobs (status, created_at DESC);
CREATE INDEX idx_jobs_company    ON jobs (company_id);
CREATE INDEX idx_jobs_filters    ON jobs (location, shift, experience_level);

CREATE TABLE resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content_md  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, title)
);
CREATE INDEX idx_resumes_user ON resumes (user_id);

CREATE TABLE applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id             TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resume_id           UUID REFERENCES resumes(id) ON DELETE SET NULL,
  resume_snapshot_md  TEXT NOT NULL,   -- copy at apply time; company sees what was submitted
  cover_note          TEXT,
  status              application_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at         TIMESTAMPTZ,
  UNIQUE (job_id, user_id)             -- no duplicate applications
);
CREATE INDEX idx_applications_job  ON applications (job_id, status);
CREATE INDEX idx_applications_user ON applications (user_id, created_at DESC);
