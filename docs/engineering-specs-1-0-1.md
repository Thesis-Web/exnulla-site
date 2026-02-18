# ExNulla Site Engineering Specs

## Architecture Summary

Static-first shell + isolated demos.

- **Shell:** Astro static output, minimal JS, SEO-friendly.
- **Demos:** independently buildable static artifacts embedded via iframe.
- **Hosting:** Nginx on droplet behind Cloudflare (cache rules optional).
- **Deploys:** atomic releases with rollback.
- **Provenance:** build metadata published at `/meta/version.json`.

---

## System Objectives

The system must:

- load quickly (static shell; small JS footprint),
- provide “wow” through intentional boundaries and provenance,
- support interactive demos without polluting the shell,
- remain operable by one person: simple deploy, rollback, recovery,
- keep CI consistent and reliable.

Non-goals (v1):

- user-submitted code execution,
- auth/accounts,
- DB dependency,
- SSR requirements.

---

## Route Model

Required:

- `/`
- `/cv`
- `/projects`
- `/projects/<slug>`
- `/lab`
- `/lab/<demo>`
- `/demos/<demo>/`
- `/links`
- `/contact`
- `/press-kit`
- `/meta`
- `/meta/version.json`

---

## UI Engineering Pattern: “Spec-like Pages”

Pages (especially project detail) should read like structured engineering docs:

**Problem → Constraints → Approach → Trade-offs → Result → Artifacts**

Implementation:

- Astro pages composed from data models (TS objects) initially,
- optionally move long-form to Markdown/MDX later without changing route structure.

---

## Provenance / Version Stamping

### Build provenance (site)

During every site build generate:

- `site/public/meta/version.json`
- `site/src/generated/version.ts` (for build-time import)

Fields:

- `gitSha`
- `gitShortSha`
- `buildTimestampUtc`
- `buildEnv`:
  - node version
  - platform
  - arch
  - ci bool
  - runner identifier

Expose:

- `/meta` page renders `version.ts`
- Footer displays `v<shortsha> • <timestamp>` linking to `/meta`

### Demo provenance

Each demo must output:

- `demos/<demo>/dist/meta.json` (copied/served under `/demos/<demo>/meta.json`)

Fields:

- demo name
- source repo/path
- commit SHA (if vendored)
- build timestamp
- tier

---

## Demo Size Tiers

### Tier 1 — Lightweight Islands

- Implement as Astro component/island
- Lazy load when possible
- Keep JS footprint minimal

### Tier 2 — Independent Demo Artifact

- Separate Vite build
- Served at `/demos/<demo>/`
- Embedded via iframe in `/lab/<demo>` and/or runner panel

Iframe sandbox default:

- `allow-scripts allow-same-origin`

### Tier 3 — Heavy Demo

- Same as Tier 2 OR external host (Vercel)
- Must never degrade landing performance
- Still embedded via iframe with constraints

---

## Lab Runner Behavior (Required)

On `/lab`:

- tiles list only metadata
- user click loads iframe into runner panel
- only one active demo at a time:
  - destroy previous iframe on switch
- show load time metrics (ms) in UI

Rationale:

- lifecycle control, isolation, performance awareness.

---

## Terminal Block (“Quiet Wow”)

Landing page embeds a terminal block using the ported `TerminalTyper` engine.

Requirements:

- boots only on visibility or interaction
- manual tabs (no autoplay)
- supports multiple scripts:
  - default tab: Attest / hostile JSON (non-vanilla)
  - secondary: ops maturity snippet
  - optional: TS/Go/Rust variants

Security:

- no dynamic imports from arbitrary origins
- no eval
- no user-provided input execution

---

## Build System

### Root workflow

Repository root build should:

- build site
- (later) build demos
- generate provenance metadata
- verify outputs exist

Current path:

- `npm --prefix site run build` builds the shell and runs `prebuild` for version stamping.

Future:

- root `npm run build` orchestrates site + demos in sequence.

---

## Deployment Architecture (Droplet)

### Filesystem layout

/var/www/exnulla-site/

- releases/<timestamp>/
- current -> releases/<timestamp>
- shared/ (optional: assets/logs)

Deploy steps:

1. build site + demos
2. create new release dir
3. rsync artifacts into release dir
4. atomically repoint `current` symlink
5. `nginx -t` then reload

Rollback:

- repoint `current` to prior release
- reload Nginx

---

## CI Requirements

CI must:

- run on Node 20
- `npm ci`
- `npm run format:check` (repo root)
- `npm run lint --if-present`
- `npm run build --if-present`
- preserve markdownlint scope (no dependency README lint)

---

## Security Model

- No user code execution.
- Demos isolated via iframe sandbox.
- Avoid allowing:
  - top navigation
  - popups
  - forms escape
    unless explicitly required by a specific demo.

---

## Performance Targets

- Landing page:
  - minimal JS
  - no heavy demo code loaded by default
  - images optimized
- Lab:
  - metadata only initial render
  - demos load only on click
- Demos:
  - may be heavy, but contained and not impacting shell

---

## Definition of Done (v1)

- IA routes exist and build.
- `/meta/version.json` exists and footer shows version.
- Lab runner loads one demo at a time (iframe lifecycle).
- Terminal block present and not heavy.
- CI passes.
- Atomic deploy + rollback documented and tested (ops docs).

## Guardrails

- Static-first pages; demos loaded on demand.
- Demos run in iframes with sandbox restrictions.
- Curated set: max 12 tiles on `/lab`.
- Version stamp per demo (commit SHA + build date).
- Build + deploy must support atomic release + rollback.

## Domains / Hosting

- DNS managed in Cloudflare.
- Origin served from droplet (Nginx).
- Target hostnames (proposed):
  - `exnulla.<domain>` -> main site
  - `lab.exnulla.<domain>` (optional; stronger isolation) -> demos
- Cloudflare SSL Full (Strict) recommended.
- No direct public admin endpoints.

## Repo Layout (target)

exnulla-site/
README.md
LICENSE
docs/
blueprint.md
engineering-specs.md
ops/
releases.md
runbooks.md
site/ # main site source (static-first)
package.json
src/
public/
demos/ # demo sources (one subdir per demo)
<demo-name>/
package.json
src/
assets/ # shared assets checked into this repo (logos, images)
branding/
screenshots/
import/ # scripts + mappings for pulling assets from other repos / desktop
manifests/
scripts/
nginx/
exnulla-site.conf # vhost templates
lab.conf # optional subdomain vhost templates
scripts/
build-all.sh
deploy.sh
verify.sh
stamp-version.sh

## Initial Milestones

- M0: Repo scaffolding + CI stub (lint/build)
- M1: Landing + /cv + /projects + /projects/<slug>
- M2: /lab + 1 demo embedded via iframe + version stamp
- M3: Nginx vhost + atomic deploy + rollback docs
- M4: Import pipeline: pull assets/sims from other repos + desktop

### Social Links at the Bottom

## Clickable icons:

- youtube
- instagram
- facebook
- x
- tictok
- linkedin

## CI/CD Add-ins (v1+)

We will implement **1–2 CI/CD-powered add-ins** to increase “wow factor” and reduce manual ops.

### CI/CD Add-in #1 (required): Main site auto-deploy

- Trigger: push to `main`
- Action: build + deploy to droplet using atomic releases + rollback
- Outcome: `exnulla.<domain>` always reflects the latest approved `main`

### CI/CD Add-in #2 (optional): Demo pipeline

Choose one (can evolve over time):

- **A (default):** GH Actions builds + deploys demos to droplet under `/demos/<name>/`
- **B (heavy demo):** GH Actions publishes a specific heavy demo to Vercel; site embeds via iframe

## Repo Hygiene Baseline (required)

# Repo Hygiene Baseline (required)

This repo must ship with baseline hygiene from day 0:

- `.editorconfig`
- Prettier (`format`, `format:check`)
- Markdownlint (`lint:md`)
- GitHub Actions CI matching `thesisweb-backend` conventions:
  - Node 20 + npm cache
  - `npm ci`
  - `npm run format:check`
  - `npm run lint --if-present`
  - `npm run build --if-present`
  - `npm run typecheck --if-present`

## Backend Integration Policy

We already have `thesisweb-backend` on the droplet. We may tap it for **optional augmentation** only.

### Rules

- Site must remain functional without backend (static-first).
- Backend endpoints for ExNulla must be scoped under `/api/exnulla/*`.
- Prefer read-only endpoints for v1.
- No cross-project coupling (no shared DB schema changes unless explicitly planned).

### Candidate endpoints (v1.1+)

- `GET /api/exnulla/lab-index` (demo tile metadata)
- `GET /api/exnulla/releases` (release history / current SHA)
- `GET /api/exnulla/demo/:name/version` (demo version stamp)
