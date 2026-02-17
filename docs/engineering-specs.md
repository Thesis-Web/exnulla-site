# ExNulla Site Engineering Specs

## Architecture Summary

We will build a static-first website with a curated interactive Lab.

-   Main site: static output, minimal JS, SEO-friendly.
-   Demos: independently buildable static artifacts, embedded via
    iframe.
-   Hosting: Nginx on droplet behind Cloudflare.
-   Deploys: atomic releases with rollback.

------------------------------------------------------------------------

## System Objectives

The system must:

-   Be fast and static by default.
-   Support embedded interactive demos of varying size.
-   Support atomic deploy and rollback.
-   Maintain strict repo hygiene.
-   Allow future scaling without architectural rewrite.

------------------------------------------------------------------------

## Tech Choices (v1)

### Frontend Framework

-   Main site: Astro (preferred) OR Next static export
    -   Decision criteria: fastest static output plus simple content
        authoring and islands support.
-   Styling: Tailwind (or vanilla CSS modules if preferred).
-   Content: Markdown or MDX for case studies and pages.

### Demo Framework

-   Per-demo Vite build (React, Svelte, or Vanilla depending on demo).
-   Each demo builds to its own dist directory served at a fixed path.

------------------------------------------------------------------------

## Route Model

Required routes:

-   / --- Landing
-   /cv --- Digital CV
-   /projects --- Case studies index
-   /projects/`<slug>`{=html} --- Case study detail
-   /lab --- Demo index
-   /lab/`<demo>`{=html} --- Demo wrapper page
-   /demos/`<demo>`{=html}/ --- Static demo artifact
-   /contact
-   /links
-   /press-kit (optional v1)

------------------------------------------------------------------------

## Demo Size Tiers

### Tier 1 --- Lightweight Components

Examples: - Interactive diagrams - Sliders with calculations - Small
visualizers

Implementation: - Implemented as Astro island or small component. -
Bundled into main site build. - Target small JS footprint. - Lazy loaded
where possible.

------------------------------------------------------------------------

### Tier 2 --- Medium Standalone Demo

Examples: - WebGL visualization - Multi-panel simulation UI - Tool-style
interface

Implementation: - Built as independent Vite app. - Output directory:
demos/`<name>`{=html}/dist

Delivery: - Embedded in /lab/`<name>`{=html} using iframe. - Served
from: /demos/`<name>`{=html}/

Isolation: - iframe sandbox attribute: allow-scripts allow-same-origin

------------------------------------------------------------------------

### Tier 3 --- Heavy Demo

Examples: - Large WebGL compute scenes - Intensive rendering - Large
dependency bundles

Implementation Options:

Option A (default): - Built and deployed to droplet like Tier 2.

Option B (performance isolation): - Built via GitHub Actions. - Deployed
to Vercel. - Embedded via iframe from external origin.

Heavy demos must not degrade main site performance.

------------------------------------------------------------------------

## Build System

### Root Build Command

The repo must support:

npm run build

Which performs:

1.  Build main site
2.  Build all demos
3.  Generate version metadata
4.  Run verification checks

------------------------------------------------------------------------

## Version Stamping

Each build must generate:

meta/version.json

Containing: - git SHA - build date (UTC) - build environment

Each demo must generate:

demos/`<name>`{=html}/meta.json

Containing: - demo name - commit SHA - source repo path - build date

This enables provenance and optional backend augmentation.

------------------------------------------------------------------------

## Deployment Architecture

### Filesystem Layout (Droplet)

Recommended layout:

/var/www/exnulla-site/ releases/ `<timestamp>`{=html}/ current -\>
releases/`<timestamp>`{=html} shared/

Rollback procedure: - Repoint current symlink. - Reload Nginx.

------------------------------------------------------------------------

## CI Requirements

CI must match thesisweb-backend conventions:

-   Node 20
-   npm cache
-   npm ci
-   npm run format:check
-   npm run lint --if-present
-   npm run build --if-present
-   npm run typecheck --if-present

------------------------------------------------------------------------

## CD (Optional but Recommended)

GitHub Actions to Droplet:

-   Trigger on push to main.
-   Build artifacts.
-   SSH deploy using stored key.
-   Atomic release.
-   Nginx config test before reload.

------------------------------------------------------------------------

## Backend Integration (Optional)

We may reuse thesisweb-backend.

Constraints:

-   Site must function without backend.
-   Endpoints must be namespaced under: /api/exnulla/
-   Version 1 endpoints must be read-only.

Candidate endpoints:

-   GET /api/exnulla/releases
-   GET /api/exnulla/lab-index
-   GET /api/exnulla/demo/`<name>`{=html}/version

Backend may read JSON artifacts generated during build.

No database required for version 1.

------------------------------------------------------------------------

## Security Model

### Iframe Restrictions

Default sandbox:

allow-scripts allow-same-origin

Never allow: - top navigation - popups - form escape

Unless explicitly required.

### No User Code Execution (v1)

-   No eval
-   No user-submitted code
-   No server-side execution for demos
-   No dynamic imports from arbitrary origins

------------------------------------------------------------------------

## Performance Targets

Landing page: - Minimal JS - Lazy load heavy components - Optimized
images

Lab page: - Load metadata only - Load demos only on interaction

Heavy demos: - Must not impact initial page load

------------------------------------------------------------------------

## Definition of Done (v1)

-   Landing page exists.
-   CV page exists.
-   Projects index exists.
-   Lab page exists.
-   One demo shipped.
-   Version stamp visible.
-   CI passing.
-   Atomic deploy functional.
-   Rollback tested.

------------------------------------------------------------------------

## Out of Scope (v1)

-   Auth
-   User accounts
-   Payments
-   DB-backed content
-   Real-time compute endpoints
