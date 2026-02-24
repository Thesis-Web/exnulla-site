# Demo Blueprint — Security-Conscious Micro-Backend Showcase (Fastify + Helmet + Rate Limits + SQLite)

**Demo ID (slug):** `micro-backend-showcase`  
**Tier:** 2 (iframe-isolated Vite artifact)  
**Primary repo (source of truth):** `thesisweb-backend`  
**Primary value signal:** “I build backends that survive reality: validation, abuse resistance, safe persistence, and operational boundaries.”

---

## 1) Executive Summary

This demo is a **browser-driven request harness** that hits a small Fastify service and makes the “boring but critical” production behaviors **visible**:

- strict JSON schema validation (Fastify route schema, `additionalProperties: false`)
- security headers via `@fastify/helmet`
- global rate limiting via `@fastify/rate-limit` (default: 30 req/min)
- persistence to SQLite (`better-sqlite3`, WAL) with **idempotent** duplicate handling
- a **honeypot** field for bots that results in a silent `204`

The hiring-manager moment is when they can **watch a request storm** turn into `429`s, inspect headers, and see how the API behaves under malformed payloads and abuse patterns.

---

## 2) Source Material (Verified in repo)

From `thesisweb-backend-main.zip`:

- `src/server.ts`
  - `@fastify/helmet` global registration
  - `@fastify/rate-limit` global registration (`max: 30`, `timeWindow: "1 minute"`)
  - `POST /v1/signup` schema (email required, `additionalProperties: false`)
  - honeypot field `hp` ⇒ `204` (do nothing)
  - email regex check ⇒ `400 { error: "invalid_email" }`
  - SQLite insert + unique email index ⇒ duplicates return `200 { ok: true, already: true }`
- `src/migrate.ts`
  - creates `signups` table + indexes
- `docs/frontend-backend-routing.md`
  - production rewrite concept: `/api/signup` → `http://127.0.0.1:8787/v1/signup`

---

## 3) Demo Goals

### 3.1 What the demo must prove

1. **Abuse resistance** is not a buzzword: the backend refuses oversized bodies, rejects unexpected fields, rate-limits bursts, and hardens headers.
2. **Correctness under failure**: email sending is best-effort and never blocks signup success.
3. **Operational boundaries**: backend binds to localhost, sits behind nginx rewrite, persists locally, and remains deterministic/inspectable.

### 3.2 What the demo must feel like

- Fast and interactive (no “read a wall of text”)
- Safe (no PII stored from demo usage beyond what backend already does; demo encourages disposable emails)
- Explainable (each behavior has a short reason and an observable artifact)

---

## 4) Non-Goals

- No admin UI for browsing real signups.
- No production email sending in demo mode.
- No “real” DDoS simulation (this is a controlled burst harness; we cap max concurrency client-side).
- No advanced auth flows (JWT/OAuth) in this demo; scope is “public marketing endpoint done correctly.”

---

## 5) Target Audience & Narrative

### Audience

- Hiring managers / staff engineers
- DevOps/security-aware reviewers
- Anyone skeptical of “frontend-only” portfolios

### Narrative arc (60–90 seconds)

1. **Valid request** → `201 { ok: true }`
2. **Bad email** → `400 invalid_email`
3. **Extra field** (schema strictness) → `400` with schema error
4. **Honeypot** (bot trap) → `204` and no side effects
5. **Burst** → `429` rate-limited, headers visible
6. **Duplicate email** → idempotent `200 { ok: true, already: true }`

---

## 6) UX Specification

### 6.1 Layout (three-column)

**Left: Controls**

- Target mode:
  - `Same-origin (/api/signup)` (default in production)
  - `Direct (/v1/signup)` (useful when running locally without nginx rewrite)
  - `Custom URL` (advanced; hidden behind “Advanced” toggle)
- Burst controls:
  - `total requests` (1–300)
  - `concurrency` (1–25)
  - `inter-request delay (ms)` (0–500)
- Payload mode (radio):
  - `valid`
  - `invalid_email`
  - `extra_property`
  - `honeypot_filled`
  - `duplicate_email`
- Deterministic seed input:
  - `seed` (string) → generates deterministic email(s) and request order
- Action buttons:
  - **Run**
  - **Stop**
  - **Reset**

**Center: Live Results**

- Request timeline feed (most recent on top):
  - `#`, timestamp, status, latency, short reason tag (e.g., `RATE_LIMIT`, `SCHEMA`, `OK`, `HONEYPOT`)
- Aggregates:
  - status code histogram
  - latency p50/p95 (approx OK)
  - “rate-limited count”
- Optional small chart:
  - requests/sec vs 429s (keep lightweight; can be bars)

**Right: Explainer + Inspect**

- “What you are seeing” accordion sections:
  - Schema validation
  - Rate limits
  - Security headers
  - SQLite + idempotency
  - Honeypot behavior
- Response inspector:
  - last response JSON body
  - last response headers (filtered set)
    - security headers (helmet)
    - rate limit headers (if present)
    - `retry-after` (if present)
- Copy/paste `curl` examples (reflect current settings)

### 6.2 Visual language

- Minimal UI, black/gray/white.
- Emphasis on **status codes**, **headers**, and **reasons**.
- No heavy animations; focus on responsiveness.

---

## 7) Functional Specification

### 7.1 Deterministic request generator

- Input: `seed`, `payload mode`, `total`, `concurrency`, `delay`
- Output: deterministic sequence of requests:
  - deterministic email generation (e.g. `demo+<hash>@example.invalid`)
  - deterministic request ordering
- Requirement: same inputs ⇒ same sequence (for shareable permalinks later)

### 7.2 Payload definitions (exact)

Based on backend schema in `src/server.ts`:

```json
{
  "email": "string (required, 3..320)",
  "name": "string (optional, 1..80)",
  "source": "string (optional, 1..80)",
  "hp": "string (optional, <=200)"
}
```

Payload modes:

- `valid`
  - `email`: generated
  - `name`: `"ExNulla Demo"`
  - `source`: `"exnulla-lab"`
  - `hp`: `""` (or omitted)
- `invalid_email`
  - `email`: `"not-an-email"`
- `extra_property`
  - include `"role": "admin"` to trigger `additionalProperties: false`
- `honeypot_filled`
  - `hp`: `"I am a bot"` → expect `204`
- `duplicate_email`
  - use same deterministic email for all requests → expect first `201`, then `200 { already: true }` (or all 200 if already exists)

### 7.3 Result classification (client-side)

Map responses into reason tags:

- `201` → `OK_CREATED`
- `200` with `{ already: true }` → `OK_IDEMPOTENT`
- `204` → `HONEYPOT`
- `400`:
  - if body `{ error: "invalid_email" }` → `INVALID_EMAIL`
  - else → `SCHEMA_REJECT` (Fastify schema errors)
- `429` → `RATE_LIMIT`
- `5xx` → `SERVER_ERROR`

### 7.4 Safe client-side limits

Even if user drags sliders:

- hard cap `concurrency <= 25`
- hard cap `total <= 300`
- add “cooldown” between runs if `total*concurrency` exceeds threshold (purely UI-level)

---

## 8) System Architecture

### 8.1 Production topology (recommended)

- Browser demo runs under `exnulla.com` (same origin).
- Nginx exposes:
  - `POST /api/signup` → `http://127.0.0.1:8787/v1/signup`
  - optionally `GET /api/healthz` → `http://127.0.0.1:8787/healthz`
- Backend binds to `127.0.0.1` only.

**Why:** avoids CORS complexity; makes the demo realistic and clean.

### 8.2 Local dev topology

Two paths:

1. Run backend on localhost `8787` and set demo target to `/v1/signup` at same origin via dev proxy.
2. Or run nginx locally (optional; heavier).

### 8.3 Demo artifact packaging

- Build as Vite static artifact.
- Published to: `/demos/micro-backend-showcase/`
- Embedded at: `/lab/micro-backend-showcase` with iframe sandbox.

---

## 9) API Contract (Demo-Assumed)

### Endpoints

- `POST /v1/signup`
  - body schema above
  - returns:
    - `201 { ok: true }`
    - `200 { ok: true, already: true }`
    - `204` (honeypot)
    - `400 { error: "invalid_email" }` or Fastify schema error response
    - `429` on rate limit
- `GET /healthz`
  - returns `200 { ok: true }`

### Expected header behaviors

- Security headers from helmet (exact set may vary by version/config).
- Rate limiting may expose:
  - `retry-after`
  - rate limit headers (varies by plugin version/settings)

**Demo must not depend on any single header name**; instead:

- present a curated list of “interesting headers” when present
- always show **raw header map** in an expandable section

---

## 10) Security & Privacy Considerations (Demo-Specific)

- The demo should default to a clearly non-real email domain:
  - `example.invalid` (or `example.com` if you prefer, but `.invalid` is best)
- Include a banner:
  - “Use a disposable email; this endpoint persists to SQLite.”
- In demo/production, set `EMAIL_PROVIDER=none` (or ensure not configured) so no emails are sent.

Optional hardening:

- allowlist `source: "exnulla-lab"` from demo; do not add this constraint until engineering-specs phase (it changes the backend contract).

---

## 11) Telemetry & Debug UX

### Client-side

- compute per-request latency using `performance.now()`
- provide export:
  - “Copy run report” → JSON blob including inputs + summary + first N request results

### Server-side (already)

- Fastify logging is enabled (`logger: true`).
- Warn log when welcome email fails: `welcome_email_failed`.

---

## 12) Acceptance Tests (Demo)

### A) Happy path

- Run `total=1`, `valid`:
  - status is `201` or `200 already` depending on DB state
  - response body contains `{ ok: true }`

### B) Schema strictness

- `extra_property`:
  - status `400`
  - body indicates schema rejection (Fastify error format)

### C) Honeypot behavior

- `honeypot_filled`:
  - status `204`
  - no JSON body required

### D) Rate limit behavior

- `valid`, `total=100`, `concurrency=25`, `delay=0`:
  - some `429` responses
  - `retry-after` or rate limit headers often visible (do not hard-require)

### E) Idempotency

- `duplicate_email`, `total=10`:
  - at least 1 `200 { already: true }` if DB already has the email
  - no `500` errors due to UNIQUE constraint

---

## 13) ExNulla-Site Integration Notes

### 13.1 Lab tile metadata (proposed)

Create `site/src/content/lab/micro-backend-showcase.json` (or equivalent, based on current content system):

```json
{
  "slug": "micro-backend-showcase",
  "name": "Micro-Backend: Abuse-Resistant Signup",
  "tier": 2,
  "tags": ["fastify", "security", "rate-limit", "sqlite", "schema"],
  "artifactPath": "/demos/micro-backend-showcase/",
  "source": {
    "repo": "Thesis-Web/thesisweb-backend",
    "paths": ["src/server.ts", "src/migrate.ts", "docs/frontend-backend-routing.md"]
  },
  "hook": "Watch a request storm turn into 429s — with headers, schema errors, honeypots, and idempotency made visible."
}
```

### 13.2 Demo artifact meta.json (proposed)

`/demos/micro-backend-showcase/meta.json`:

```json
{
  "name": "Micro-Backend Showcase",
  "slug": "micro-backend-showcase",
  "tier": 2,
  "requiresBackend": true,
  "backendRoutes": ["/api/signup", "/api/healthz"],
  "version": {
    "builtAt": "<ISO8601>",
    "gitSha": "<SHA of demo artifact repo>"
  }
}
```

---

## 14) Engineering-Specs Seed (What comes next)

This blueprint intentionally stops before implementation details. The engineering-specs phase should pin:

- exact demo repo location (`exnulla-site/demos/micro-backend-showcase/` vs a separate repo)
- Vite template choice (React vs vanilla TS) and build pipeline
- nginx rewrite rules in the droplet:
  - `/api/signup` → backend
  - `/api/healthz` → backend
- backend deploy strategy (systemd service for `thesisweb-backend`)
- demo “safe mode” behavior when backend is unreachable:
  - show a clean “Backend offline” panel
  - allow running a simulated mode (optional; recommended for local dev UX)

---

## 15) Implementation Checklist (High-Level)

- [ ] Build Tier-2 Vite app for the harness UI
- [ ] Deterministic request generator + permalink encoding (optional but recommended)
- [ ] Response classification + inspector panel
- [ ] Lightweight timeline + summary stats
- [ ] Integrate into `/lab` runner (iframe)
- [ ] Add docs page (demo readme) embedded on wrapper route
- [ ] Configure nginx rewrite routes for backend
- [ ] Ensure backend runs with `EMAIL_PROVIDER=none` in demo environment

---

## 16) “Wow Factor” Enhancers (Optional, Safe)

1. **Permalinked runs**  
   Encode demo inputs into query params. “Same settings, same run behavior.”

2. **Diff view of payload mutation**  
   Show exactly what the demo sent vs what the API expects (schema panel).

3. **Nginx boundary callout**  
   One small diagram: browser → nginx (`/api/*`) → localhost backend (`/v1/*`).

---

## 17) Risks / Failure Modes

- CORS issues if demo hits a different origin  
  **Mitigation:** same-origin rewrite via nginx.
- Rate-limit headers vary across versions/config  
  **Mitigation:** never hardcode header names; surface raw headers too.
- Demo traffic pollutes real signup DB  
  **Mitigation:** use `.invalid` domain + optional separate DB path for demo route set (engineering-specs decision).

---

## 18) Definition of Done

- Demo runs in iframe and produces visible, categorized results for:
  - OK / invalid email / schema reject / honeypot / rate-limit
- Shows response headers and JSON body in inspector
- Can be operated by a first-time visitor in < 30 seconds
- No fragile assumptions about exact header names or error formats
