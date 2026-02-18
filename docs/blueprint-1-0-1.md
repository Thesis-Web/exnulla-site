# ExNulla Site Blueprint

## Mission

Build **exnulla.com** as a **Digital CV + Interactive Lab** that:

- loads like a small, static, “boring fast” site,
- reveals depth through deliberate technical choices,
- showcases proof-of-work (case studies + runnable demos),
- funnels to **Kick (primary)** → Twitch → LinkedIn → repos.

This site is “paper” for senior-level capability: problem framing, systems thinking, operational discipline, and fast iteration.

---

## Core Positioning

**Toyota, not a race car.**

- Reliable, deterministic, repeatable.
- Innovative in the _useful_ places.
- Avoid overengineering; favor intentional boundaries.

Primary signal: **deployment rigor + infrastructure maturity**, expressed through a static-first site with provenance, atomic releases, and isolation patterns.

---

## Primary UX Funnel

### Primary CTA

- **Watch Live (Kick)**

### Secondary CTA

- Twitch
- LinkedIn (network-first contact)

### Tertiary

- Projects (case studies)
- Lab (demos)
- Links hub
- Press kit
- Contact (LinkedIn-first, email secondary)

---

## “Wow Without Weight” Principle

The site should **paint instantly** and then **progressively reveal** technical depth.

Rules:

- Static HTML first; minimal JS.
- JS is opt-in (on interaction or viewport visibility).
- Demos run outside the shell via **iframe isolation**.
- Only one demo active at a time; destroy previous demo on switch.
- Build provenance is always visible and verifiable.

---

## IA (Information Architecture)

### Required routes (v1)

- `/` — Landing
  - hero narrative + CTAs
  - subtle “quiet wow” (Terminal block)
  - featured project + featured demo
- `/cv` — Digital CV
  - evidence-driven CV sections
  - headshot linking to LinkedIn
- `/projects` — Case study index
- `/projects/<slug>` — Case study detail
  - Problem / Constraints / Approach / Trade-offs / Result
  - artifacts: repo links, diagrams, clips
  - optional embedded demo (iframe)
- `/lab` — Lab index
  - curated tiles + runner panel (loads demos on click)
- `/lab/<demo>` — Demo wrapper page
  - frame + readme + links + metadata
- `/demos/<demo>/` — Static demo artifact (built separately)
- `/links` — Link hub for bios
- `/contact` — LinkedIn-first contact
- `/press-kit` — logos, colors, short bio, screenshots
- `/meta` — build provenance page
- `/meta/version.json` — raw provenance JSON

### Optional routes (v1.1+)

- `/now` — current focus
- `/stream-kit` — stream stack + commands
- `/gear` — hardware/software

---

## Signature “Quiet Wow” Feature: Terminal Block

Landing page includes a small terminal that feels like a real dev environment (Ubuntu/Endeavour aesthetic).

Behavior:

- terminal only boots when visible or interacted with
- manual tab switch (no autoplay gimmicks)
- scripts are real snippets derived from actual repo/tools

Tabs (initial):

- **B (default): Attest / hostile JSON** pipeline snippet (non-vanilla)
- A: ops maturity snippet (timer/systemd example)

Implementation target:

- `TerminalTyper.ts` engine ported
- scripts per language:
  - `bash.ts` (ops maturity)
  - `ts.ts` (attest pipeline)
  - `go.ts` (deterministic hashing / canonicalize example)
  - `rust.ts` (parser/state-machine fast path)

---

## Lab Runner Flex (Core Differentiator)

On `/lab`:

- show tiles
- click tile loads iframe into a runner panel
- only one active iframe at a time (destroy previous)
- show load-time metrics (ms)
- iframe sandbox defaults: `allow-scripts allow-same-origin`
- heavy demos stay isolated and must not impact landing performance

This signals:

- lifecycle control
- performance awareness
- intentional runtime boundaries

---

## Content Model (Case Studies)

Each case study must include:

- Title + one-line outcome
- Problem
- Constraints
- Approach / Architecture (diagram or structured bullets)
- Trade-offs
- Result (measurable when possible)
- Artifacts:
  - repo links
  - related demo
  - related stream clip/VOD link

Layout style:

- reads like an architecture/spec markdown (sections, code blocks, math allowed)

---

## Demo Model (“Lab Tiles”)

Each demo tile must include:

- name + description
- tags
- tier (1/2/3)
- source path + repo
- demo artifact path (`/demos/<demo>/`)
- wrapper route (`/lab/<demo>`)

Tiers:

- Tier 1: lightweight island (minimal JS)
- Tier 2: Vite artifact embedded via iframe
- Tier 3: heavy demo; optionally external hosted and framed

---

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
site/
package.json
src/
public/
meta/version.json
demos/
<demo-name>/
src/
dist/
meta.json

package.json
src/
dist/
meta.json
assets/
branding/
screenshots/
import/
manifests/
scripts/
build-all.sh
deploy.sh
verify.sh
stamp-version.sh
nginx/
exnulla-site.conf
lab.conf

---

## First Showcase Demos (target set)

Initial “wow” demos pulled from thesis-chain:

1. Attest pipeline (hostile JSON → canonicalize → digest → reasons)
2. Tenure simulation
3. Mining lottery simulation
4. Reward lottery / lottery v2

These are deterministic, explainable, and visually demonstrable.

---

## Operational Guardrails

- Never move/delete `site/` without pwd+ls confirmation.
- Commit scaffolds immediately.
- Provenance required on every build (`/meta/version.json`).
- Atomic release deploy + rollback is required before scaling demo count.

## Domains / Hosting

- DNS managed in Cloudflare.
- Origin served from droplet (Nginx).
- Target hostnames (proposed):
  - `exnulla.<domain>` -> main site
  - `lab.exnulla.<domain>` (optional; stronger isolation) -> demos
- Cloudflare SSL Full (Strict) recommended.
- No direct public admin endpoints.

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
