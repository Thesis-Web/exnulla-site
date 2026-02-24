# Demo Integration Blueprint — ExNulla Site (Static-First, Iframe-Isolated, Provenance-Stamped)

**Repo:** `exnulla-site`  
**Scope:** how interactive demos are sourced, built, embedded, versioned, validated, and served without sacrificing static performance or operational simplicity.  
**Decision locked:** **Model A — Static Artifact Embedding** (iframe + path isolation).

---

## 0) Goals

### Primary goals

- Keep the **shell** (Astro site) **static and fast**.
- Make the site feel “dynamic” via **iframe-isolated demos**.
- Ensure demos are:
  - independently buildable,
  - reproducibly embedded,
  - provenance-stamped,
  - CI-validated,
  - easy to roll back.

### Non-goals (v1)

- No user-submitted code execution.
- No server-side demo execution.
- No multi-container orchestration.
- No runtime demo compilation on the droplet.

---

## 1) Integration Model (Locked)

### Model A — Static Artifact Embedding (Canonical)

- Each demo produces a static build artifact (**`index.html` + assets/**).
- Artifacts are placed in:
  - `site/public/demos/<demo-slug>/`
- The shell loads a demo via:
  - `<iframe src="/demos/<demo-slug>/index.html">`

### Why this model wins

- **Zero runtime coupling** between shell and demos.
- Demos are cacheable and can be served like any other static asset.
- Keeps Docker + CI simple: build → copy artifacts → ship.
- Operationally deterministic: one image = one set of demo artifacts.

---

## 2) Directory Contract (Hard Rule)

**Canonical layout**

```
site/public/
  demos/
    <demo-slug>/
      index.html
      assets/...
      meta.json        (optional per-demo)
```

**Rules**

- `index.html` must exist at `/demos/<demo-slug>/index.html`.
- All demo assets must be referenced **relative to that folder** (no absolute `/` paths unless intentionally pinned).
- Demos may not write outside their iframe boundary (no shell DOM access).

**Current repo state**

- `site/public/demos/*` currently contains **placeholder** folders:
  - `attest-pipeline/placeholder/index.html`
  - `backend-tap/placeholder/index.html`
  - `lab-runner-core/placeholder/index.html`
  - `tenure-sim/placeholder/index.html`

Placeholders remain acceptable, but the build pipeline must be able to replace them with real artifacts deterministically.

---

## 3) Demo Sourcing Strategy (No Drift)

### 3.1 Source-of-truth

Each demo is source-controlled in its own repo.

**Preferred**: separate repos under your org to keep demo identity strong and portable.

### 3.2 How demos enter the site build context

**Canonical approach: CI fetch + build + copy artifacts**

- CI checks out `exnulla-site`.
- CI fetches each demo repo at a pinned SHA commit (from a manifest).
- CI builds demos (Node-based static build).
- CI copies the demo `dist/` into `exnulla-site/site/public/demos/<demo-slug>/`.
- CI builds the site (Astro build).
- Docker image ships the unified static output.

This keeps the site repo clean (no massive demo artifacts committed) while producing a deterministic release artifact.

### 3.3 Growth Path (v2) — Artifact-First Supply Chain

When demo count or build times grow, shift to artifact supply model:

Each demo repo:

- Has its own CI.
- Builds static artifact.
- Publishes `demo-dist-<sha>.zip` per commit.

Site CI:

1. Reads `demos/manifest.json`.
2. Downloads artifact matching pinned SHA.
3. Verifies SHA + structure.
4. Unpacks into `site/public/demos/<slug>/`.
5. Builds site + Docker image.

Determinism Requirements:

- Artifact filename must include commit SHA.
- Artifact must contain `meta.json` with:
  - repo
  - commit SHA
  - build timestamp
- Site CI must validate SHA before unpacking.

Trigger Conditions for Upgrade:

- 3 or more demos.
- CI runtime consistently > 6–8 minutes.
- Demo builds heavy (wasm, Playwright, etc.).

This preserves static runtime while improving CI speed and separation of concerns.

---

## 4) Demo Manifest (Single Source of Truth)

Create:

- `demos/manifest.json` (in `exnulla-site` repo)

Example:

```json
{
  "attest-pipeline": {
    "repo": "Thesis-Web/attest-pipeline",
    "ref": "abcdef1234567890",
    "build": "npm ci && npm run build",
    "outDir": "dist"
  }
}
```

**Rules**

- `ref` must be an immutable commit SHA (not a branch name).
- `outDir` must be a directory containing an `index.html`.

---

## 5) Provenance (Site + Demos)

You already publish:

- `/meta/version.json` (site build provenance)

Add:

- `/meta/demos.json` (demo provenance)

### 5.1 `/meta/demos.json` contract

Example:

```json
{
  "generated_at": "2026-02-23T00:00:00Z",
  "site_sha": "SITE_SHA",
  "demos": {
    "attest-pipeline": {
      "repo": "Thesis-Web/attest-pipeline",
      "sha": "abcdef1234567890",
      "artifact_path": "/demos/attest-pipeline/index.html"
    }
  }
}
```

### 5.2 Generation

- Generated during CI (or Docker build) based on the manifest + checked out demo SHAs.
- Shipped as a static file at:
  - `site/public/meta/demos.json`

---

## 6) Security Model

### 6.1 Iframe sandbox (required)

All demo iframes must use a restricted sandbox. Start with:

- `sandbox="allow-scripts allow-forms"`

Then selectively add only if needed:

- `allow-popups`
- `allow-downloads`
- `allow-pointer-lock`
- `allow-same-origin` (**avoid unless required**, because it increases the demo’s ability to behave like first-party JS)

**Default policy: do NOT grant `allow-same-origin`** unless a demo explicitly requires it.

### 6.2 CSP + headers (nginx)

Add a CSP that:

- keeps the shell strict,
- allows demo iframes to execute their own JS,
- avoids demo JS running in the top-level page.

Typical approach:

- Strict CSP for shell routes
- More permissive CSP for `/demos/*` (path-based policy) if necessary

Note: Cloudflare (free plan) can help with caching and basic security headers, but nginx is your deterministic baseline.

---

## 7) Performance Budget (Hard Constraints)

### 7.1 Shell budget

- Shell stays “boring fast”.
- Avoid importing demo JS into shell bundle.

### 7.2 Demo budget (recommended)

- Each demo artifact should target a size ceiling (example):
  - <= 3 MB gzipped total (HTML+JS+CSS+assets)
- Demos must be lazy-loaded (only when user navigates/opens Lab view).

### 7.3 Caching

- Set long-lived cache headers for `/demos/*` assets (hashing recommended).
- Avoid cache for `/meta/*.json` (or short TTL) to reflect deploy changes quickly.

---

## 8) Lab Runner Lifecycle (One Demo at a Time)

The shell must enforce:

- Only one demo iframe mounted at once.
- On demo switch:
  - remove old iframe from DOM,
  - create a new iframe node (fresh process),
  - do not reuse previous iframe element.
- No shared state between demos.

This prevents memory leaks, event bleed, and “phantom listeners”.

---

## 9) CI Requirements (Build Gate)

CI must validate:

### 9.1 Demo build validity

For each demo in `demos/manifest.json`:

- checkout pinned SHA
- build
- ensure `outDir/index.html` exists

### 9.2 Copy validity

- ensure `site/public/demos/<slug>/index.html` exists post-copy

### 9.3 Provenance validity

- generate `/meta/demos.json`
- verify it contains:
  - correct repo + sha per demo
  - correct artifact paths

### 9.4 Optional but recommended checks

- size budget checks (fail CI if exceeded)
- basic HTML sanity (index contains expected root element)
- ensure no absolute asset paths (unless explicitly allowed)

---

## 10) Local Developer Workflow (Ergonomics)

Provide scripts so local dev isn’t painful:

### 10.1 Fetch + build demos locally

- `./scripts/demos-sync.sh` (or `node scripts/demos-sync.mjs`)
  - reads `demos/manifest.json`
  - clones/updates demo repos into `.cache/demos/<slug>`
  - builds each demo
  - copies output into `site/public/demos/<slug>/`

### 10.2 Keep generated artifacts out of git

Artifacts should remain **uncommitted**.

- Continue to keep build artifacts out of git (placeholders can remain committed).
- Add `.cache/` and any temp demo build dirs to `.gitignore`.

---

## 11) Rollback Story (Deterministic)

Rollback means:

- pin the site image tag (or commit) that shipped the old demo SHAs.
- restart the service (systemd/docker).

Because `meta/demos.json` is shipped with the build, you can always audit exactly which demo commits were in production.

---

## 12) Required Updates to Existing Docs

These are **edits**, not new ideas:

### Update `docs/engineering-specs-*.md`

Add explicit sections for:

- Demo manifest contract
- `/meta/demos.json`
- iframe sandbox + CSP policy
- CI validation checklist
- directory contract for `/site/public/demos/<slug>/`

### Update `docs/blueprint-*.md`

Add:

- “Demo integration model is Model A” (locked)
- Link to this doc as the canonical demo-integration plan

---

## 13) Next Actions (Implementation Order)

1. Add `demos/manifest.json` (even if only 1 demo initially)
2. Add demo sync script (`scripts/demos-sync.*`)
3. Add `/meta/demos.json` generation step
4. Update Lab page to load iframe by slug + sandbox policy
5. Add CI build gate for demos + provenance
6. Add nginx headers/CSP rules for `/demos/*` as needed
7. Enforce budgets (size + lazy load)

---

## 14) Acceptance Tests

### Local

- Shell loads fast with no demo JS.
- Clicking a demo mounts an iframe.
- `/meta/demos.json` reflects correct demo SHAs.
- Switching demos unmounts prior iframe.

### CI

- CI fails if any demo build fails.
- CI fails if demo `index.html` missing.
- CI fails if `/meta/demos.json` missing or inconsistent.

### Production

- `/meta/version.json` correct.
- `/meta/demos.json` correct.
- `/demos/<slug>/index.html` served.
