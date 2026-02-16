# ExNulla Site Blueprint

## Mission
Build `exnulla-site` as a **Digital CV + Interactive Lab** (“sandbox”) that:
- communicates narrative + credibility fast (static-first),
- embeds runnable proof-of-work (interactive demos),
- funnels to live streams + LinkedIn + repos,
- stays operationally simple on a single droplet behind Cloudflare.

## Non-goals (initially)
- No user-submitted code execution.
- No auth/accounts.
- No database requirement for v1.
- No SSR requirement for v1.

## Core UX
### Primary CTA
- Watch Live (Kick/Twitch/YouTube)

### Secondary CTA
- Connect on LinkedIn
- View Projects (curated case studies)

### Help me Grow the Network 
- LinkedIN - https://www.LinkedIn/in/exnulla

### Tertiary
- Press kit / assets
- Contact

## IA (Information Architecture)
### Required routes (v1)
- `/` — Landing: tagline, CTAs, “what I build”, featured case study, featured demo tile
- `/cv` — Digital CV: skills evidence, timeline, “case study cards”
- `/projects` — Case study index (curated list)
- `/projects/<slug>` — Case study detail:
  - narrative (problem/constraints/tradeoffs/result)
  - artifacts (repo links, diagrams, clips)
  - embedded demo (iframe) if available
- `/lab` — “ExNulla Lab” index (curated sandbox tiles)
- `/lab/<demo>` — demo detail page (frame + readme + links)
- `/contact` — contact + links
- `/links` — link hub for social bios (simple, fast)
- `/press-kit` — logos, colors, short bio, screenshots (optional but recommended v1)

### Optional routes (v1.1+)
- `/now` — what I’m working on this week
- `/stream-kit` — stream stack, commands, engagement notes
- `/gear` — hardware/software list

## Content Model (Case Studies)
Each case study must include:
- Title + 1-line outcome
- Problem
- Constraints
- Architecture (diagram or structured bullets)
- Trade-offs
- Result (measurable if possible)
- Links:
  - Repo(s)
  - Related demo (if exists)
  - Related stream VOD / clip (if exists)

## Demo Model (“Lab Tiles”)
Each demo tile must include:
- Demo name + short description
- Tags (infra / thermal / stream-ops / chain / ui)
- “Weight tier” (see below)
- Links:
  - Demo route
  - Source repo path
  - Build notes

### Demo tiers
- Tier 1: lightweight island component (embedded directly, minimal JS)
- Tier 2: medium demo (iframe to `/demos/<name>/` path)
- Tier 3: heavy demo (full-page, launched from case study)

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
  site/                      # main site source (static-first)
    package.json
    src/
    public/
  demos/                     # demo sources (one subdir per demo)
    <demo-name>/
      package.json
      src/
  assets/                    # shared assets checked into this repo (logos, images)
    branding/
    screenshots/
  import/                    # scripts + mappings for pulling assets from other repos / desktop
    manifests/
    scripts/
  nginx/
    exnulla-site.conf        # vhost templates
    lab.conf                 # optional subdomain vhost templates
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
