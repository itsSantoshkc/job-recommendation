# Job Recommender (TF-IDF + Cosine Similarity)

Recommends open jobs to a user based on one of their saved markdown resumes. Everything runs inside the FastAPI process with scikit-learn. There are no external APIs and no pretrained embeddings.

Location: `backend/app/recommender/`

```
recommender/
├── text_prep.py   # markdown stripping, job document building
├── engine.py      # build_index(), recommend(), matched_keywords()
└── cache.py       # in-memory index cache, invalidation, refresh
```

## 1. How it works

```
open jobs ──► job documents ──► TfidfVectorizer.fit ──► job matrix (cached)
                                                              │
resume (md) ──► plain text ──► vectorizer.transform ──► cosine similarity
                                                              │
                      SQL candidate filter ──► rank ──► top N + matched keywords
```

1. **Index:** fit one vectorizer on all open jobs. Keep the fitted vectorizer and the job matrix in memory.
2. **Query:** transform the resume with the same vectorizer, then compute cosine similarity against every job row.
3. **Filter:** SQL decides which jobs are eligible (open, matches filters, not already applied to). Only eligible jobs are ranked.
4. **Explain:** for each result, return the strongest terms shared between resume and job.

## 2. Text preparation (`text_prep.py`)

**Job document.** Title and requirements carry more signal than the long description, so repeat them:

```python
def build_job_document(title: str, requirements: str, description: str) -> str:
    return " ".join([title] * 3 + [requirements] * 2 + [description])
```

**Resume text.** Strip markdown syntax but keep the words:

```python
import re

def strip_markdown(md: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", md)            # images
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)       # links -> label
    text = re.sub(r"`{1,3}", " ", text)                        # code ticks
    text = re.sub(r"^\s{0,3}(#{1,6}|[-*+]|>|\d+\.)\s+", " ", text, flags=re.M)
    text = re.sub(r"[*_~|]", " ", text)
    return re.sub(r"\s+", " ", text).strip()
```

## 3. Vectorizer configuration

```python
TOKEN_PATTERN = r"\.?\w+(?:[.\-]\w+)*(?:\+\+|#)?"   # keeps c++, c#, .net, node.js, ci-cd

def make_vectorizer(n_docs: int) -> TfidfVectorizer:
    return TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        max_df=0.9 if n_docs >= 10 else 1.0,   # max_df=0.9 raises on tiny corpora
        token_pattern=TOKEN_PATTERN,
    )
```

| Setting | Why |
|---|---|
| `ngram_range=(1, 2)` | Captures phrases like "machine learning", "rest api" |
| `sublinear_tf=True` | Repeating a word 20 times does not make it 20x more important |
| `stop_words="english"` | Drops filler words |
| custom `token_pattern` | The default pattern would turn `C#` into `c` and lose `.NET` entirely |
| `max_df` guard | Ignores terms in over 90% of jobs, but only when the corpus is big enough |

`TfidfVectorizer` L2-normalizes rows, so cosine similarity equals the dot product. `cosine_similarity` is used for clarity. `sklearn.metrics.pairwise.linear_kernel` gives identical results and is slightly faster.

## 4. Engine (`engine.py`)

```python
from dataclasses import dataclass
from datetime import datetime, timezone

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

@dataclass(frozen=True)
class JobIndex:
    vectorizer: "TfidfVectorizer"
    matrix: "csr_matrix"
    terms: np.ndarray            # vectorizer.get_feature_names_out(), cached once
    job_ids: list[str]
    built_at: datetime

@dataclass(frozen=True)
class Match:
    job_id: str
    score: float                 # raw cosine, 0..1
    matched_keywords: list[str]

def build_index(jobs: list[dict]) -> JobIndex | None:
    if not jobs:
        return None
    docs = [build_job_document(j["title"], j["requirements"], j["description"]) for j in jobs]
    vec = make_vectorizer(len(docs))
    matrix = vec.fit_transform(docs)
    return JobIndex(vec, matrix, vec.get_feature_names_out(),
                    [str(j["id"]) for j in jobs], datetime.now(timezone.utc))

def recommend(index: JobIndex, resume_md: str, eligible_ids: set[str],
              limit: int = 20, min_score: float = 0.05) -> list[Match]:
    resume_vec = index.vectorizer.transform([strip_markdown(resume_md)])
    if resume_vec.nnz == 0:                       # no shared vocabulary at all
        return []
    scores = cosine_similarity(resume_vec, index.matrix).ravel()
    results: list[Match] = []
    for i in np.argsort(-scores):
        score = float(scores[i])
        if score < min_score:
            break
        job_id = index.job_ids[i]
        if job_id not in eligible_ids:
            continue
        results.append(Match(job_id, score, matched_keywords(index, resume_vec, i)))
        if len(results) >= limit:
            break
    return results

def matched_keywords(index: JobIndex, resume_vec, job_row: int, top_n: int = 5) -> list[str]:
    overlap = resume_vec.multiply(index.matrix[job_row]).tocoo()   # only shared terms are non-zero
    top = sorted(zip(overlap.col, overlap.data), key=lambda p: -p[1])[:top_n]
    return [str(index.terms[c]) for c, _ in top]
```

Notes:
- `eligible_ids` comes from a SQL query (open jobs, filters applied, `NOT EXISTS` an application by this user). It also protects against a stale cache: a job closed since the last rebuild can never be returned.
- Bigrams and their unigrams can both appear in `matched_keywords` ("machine learning", "machine"). If the output looks repetitive, drop unigrams that are contained in an already selected bigram.

## 5. Cache (`cache.py`)

```python
import asyncio

class RecommenderCache:
    def __init__(self, load_jobs):
        self._load_jobs = load_jobs          # async () -> list[dict] of OPEN jobs
        self._index: JobIndex | None = None
        self._dirty = True
        self._lock = asyncio.Lock()

    def invalidate(self) -> None:
        self._dirty = True

    async def get(self) -> JobIndex | None:
        if not self._dirty:
            return self._index
        async with self._lock:
            if self._dirty:
                self._dirty = False          # clear first so invalidations during the build are not lost
                try:
                    jobs = await self._load_jobs()
                    self._index = await asyncio.to_thread(build_index, jobs)   # keep the event loop free
                except Exception:
                    self._dirty = True
                    raise
            return self._index
```

**When to invalidate:** after a job is created, edited, or closed (call `cache.invalidate()` in the job service). Also run a background task that calls `invalidate()` every `RECOMMENDER_REFRESH_MINUTES` (default 10) as a safety net.

**Multiple workers:** each worker process has its own cache, so `invalidate()` only reaches the worker that handled the write. For multi-worker deployments, compare a cheap fingerprint (`SELECT count(*), max(updated_at) FROM jobs WHERE status = 'open'`) on each request, or every few seconds, and rebuild when it changes. With a single worker, the periodic refresh is enough.

## 6. API contract

`POST /api/v1/recommendations` (role: `user`)

Request:
```json
{
  "resume_id": "uuid",
  "location": "Kathmandu",
  "shift": "full_time",
  "experience_level": "junior",
  "limit": 20
}
```
All fields except `resume_id` are optional.

Response:
```json
{
  "items": [
    {
      "job": { "id": "uuid", "title": "Backend Intern", "company": { "name": "Acme" }, "location": "Lalitpur" },
      "match_score": 34,
      "matched_keywords": ["fastapi", "postgresql", "rest api"]
    }
  ],
  "warning": null
}
```

- `match_score` = `round(cosine * 100)`. Raw cosine between a resume and a job is usually low (roughly 5 to 40), so treat it as a ranking signal, not a percentage of "fit". Suggested starting UI bands (tune against real data): **Strong** 30+, **Good** 15 to 29, **Fair** under 15.
- `warning` is set to `"resume_too_short"` when the resume has fewer than about 30 words.

## 7. Edge cases

| Case | Behavior |
|---|---|
| No open jobs | `build_index` returns `None`, response is `{"items": [], "warning": null}` |
| Resume shares no vocabulary with any job | `[]` plus `warning: "no_matching_terms"` |
| Resume very short | Run normally, set `warning: "resume_too_short"` |
| Resume not found or not owned by caller | 404 |
| User already applied to a job | Excluded from results |
| Job closed or past deadline | Excluded (SQL eligibility filter) |
| Job created after the last index build | Appears after the next rebuild (invalidate on create) |

## 8. Tests (`tests/recommender/`)

- **Ranking sanity:** a Python/FastAPI resume ranks backend jobs above a nursing job; a React/TypeScript resume ranks frontend jobs first.
- **Tech tokens:** `C#`, `C++`, `.NET`, and `Node.js` survive tokenization (assert they are in `vectorizer.vocabulary_`).
- **Eligibility:** applied and closed jobs never appear even when they score highest.
- **Thresholds:** results below `min_score` are dropped; `limit` is respected.
- **Tiny corpus:** a corpus of 1 to 3 jobs builds without raising (the `max_df` guard).
- **Cache:** `invalidate()` followed by `get()` rebuilds once, even under concurrent calls; a failed build leaves the cache dirty.
- **Explainability:** `matched_keywords` only contains terms present in both resume and job.

## 9. Known limits and upgrades

- **No synonyms.** TF-IDF matches words, so "JS" will not match "JavaScript". An optional normalization map (`js` to `javascript`, `ts` to `typescript`, `postgres` to `postgresql`, `k8s` to `kubernetes`) can be applied at the token level in `text_prep.py`. Match whole tokens, never raw substrings, so `node.js` is left alone.
- **No semantic understanding.** Different wording for the same skill will score lower. If recommendation quality becomes the bottleneck, the next step is sentence embeddings with `pgvector`, kept behind the same `recommend()` interface.
- **Experience is a filter, not a score.** `experience_level` narrows the candidates in SQL. It does not influence cosine similarity.
- **Cost scales with open jobs.** Each query is one sparse matrix product, which is fast for thousands of jobs. Revisit if the corpus reaches the hundreds of thousands.
