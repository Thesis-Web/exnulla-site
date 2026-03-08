# ExNulla Blueprint

## Human Agentic Orchestration Lab (Standalone Showpiece)

**Repository (proposed):** `exnulla-orchestration-lab`  
**Slug:** `orchestration-lab`  
**Version:** 1.1.0 (supersedes `human-agentic-trainer` v1.0.0)  
**Owner org:** `Thesis-Project` (professional)  
**Primary goal:** Portfolio-grade, standalone orchestration lab that can _optionally_ embed as a demo via iframe (static-first).

---

## 0. Positioning

This project is a **standalone orchestration lab** that teaches and demonstrates agentic pipeline mechanics with:

- **Human transport** (copy/paste between ChatGPT Projects) as the default execution provider.
- **Deterministic state machine** and **artifact ledger** as the core product.
- A clean upgrade path to API-based providers without rewriting orchestration logic.

It is intentionally “too serious” to be a toy demo.

---

## 1. Objectives

### 1.1 Core educational objectives

Teach (visibly, not abstractly):

- Role separation and instruction boundaries
- Prompt routing and supervisor logic
- Context drift origins, detection, and recovery
- Critic/revision loops and acceptance criteria closure
- Budget discipline, token economy, and trade-offs

### 1.2 Core product objectives

Provide a reproducible lab environment:

- Deterministic run capture + replay
- Run artifact inspection (graph + diffs + drift flags)
- Failure-mode injection and recovery demonstration
- Formal role contract enforcement (schema validated outputs)
- Cost and budget dashboards (simulated + estimated)

### 1.3 Optional objective (Phase 2)

Provider adapters for API orchestration (OpenAI/Anthropic/etc.) that reuse the same run state machine.

---

## 2. Constraints and non-goals

### 2.1 Constraints

- **Static-first deployment**: default build outputs a static web app.
- **Atomic deploy friendly**: build artifact can be deployed with symlink flips.
- **Iframe-safe**: must function correctly when embedded in an iframe sandbox.
- **No scraping / no UI automation**: human transport remains manual by design.

### 2.2 Non-goals (v1.1)

- No live ChatGPT UI integration.
- No storing personal secrets or API keys in the browser (Phase 2 moves to server runtime).
- No “magic” agent framework wrapper that hides orchestration mechanics.

---

## 3. Target users

- **Learners**: understand orchestration by running guided pipelines.
- **Hiring reviewers**: see a polished, deterministic systems artifact with auditability.
- **Future-you**: use specs + blueprint to build an API agent framework later without drift.

---

## 4. High-level architecture

### 4.1 Components

1. **LOC (Local Orchestration Console)**
   - Runs locally (dev) and/or as a static app (prod) with persistence in browser storage and export/import.
   - Generates role prompts, enforces contracts, logs turns, computes budgets, flags drift, scores rubrics.

2. **Run Ledger + Artifact Store**
   - Run JSON artifacts are canonical.
   - Export is deterministic: same inputs → same run structure (timestamps excluded or normalized).

3. **Inspector UI (Showpiece layer)**
   - Graph view (turn DAG)
   - Drift panels
   - Budget/cost panels
   - Failure injection controls
   - Replay timeline controls

4. **Provider Adapter Layer (Transport abstraction)**
   - HumanProvider (v1.1): manual paste-in/out
   - SimulatedProvider (v1.1): fake latency/cost/reliability without APIs
   - API Providers (v2+): optional later

### 4.2 “Square peg / round hole” mitigation

This repo is designed as standalone. If embedded into `exnulla-demos`, it is treated as a **static build artifact** embedded via iframe with a constrained integration contract (Section 13).

---

## 5. Deterministic state model

### 5.1 Canonical run artifact

`runs/<RUN_ID>/run.json`

Minimum fields:

- `schemaVersion` (semver-like)
- `gitSha` (injected at build time)
- `runId`
- `createdAt` (optional; normalized for deterministic replay exports)
- `scenarioId` (the selected training scenario)
- `roles[]` (role profiles and constraints)
- `turns[]` (ordered, each with routing metadata and validation results)
- `artifacts[]` (files/snippets produced by turns)
- `budgets` (per-turn + cumulative)
- `rubric` (scoring + thresholds)
- `drift` (flags + evidence + severity)
- `acceptance` (pass/fail + reasons)

### 5.2 Deterministic replay guarantee

Given:

- Same `scenarioId`
- Same initial `inputs`
- Same turn responses (copied)
- Same `schemaVersion`

Then:

- The run artifact validation and derived metrics must match.

---

## 6. Role system

### 6.1 Default roles

- `architect`
- `developer`
- `critic`
- `tester`
- (optional) `supervisor` (internal; LOC-driven orchestration)

### 6.2 Required ChatGPT Project setup (Human Provider)

Each role is configured as **its own ChatGPT Project** with persistent instructions.

The LOC provides:

- Copy-paste “Project Instructions” templates per role.
- A “Project Setup Checklist” with validation steps.

### 6.3 Formal role contract enforcement (new)

Each role response must conform to a strict schema (e.g., JSON or structured markdown blocks).

LOC validates:

- Schema validity
- Required fields present
- Artifact references resolvable
- No forbidden sections (role boundary rules)

If invalid:

- LOC flags a contract violation.
- LOC generates a corrective “format repair” prompt for the same role.

---

## 7. Drift detection and recovery

### 7.1 Drift signals (v1.1)

Rule-based detection, including:

- Missing constraints or acceptance criteria
- Contradictions vs. scenario requirements
- Output schema violations
- Spec deviations (e.g., wrong repo, wrong language, ignored deterministic rules)
- Over-budget warnings and verbose inflation
- “Unresolved questions” not propagated

### 7.2 Drift scoring

Each signal adds weighted severity:

- `info` / `warn` / `error`
- Cumulative drift score shown in Inspector UI

### 7.3 Recovery loops

LOC generates recovery prompts:

- “Re-anchor constraints” prompt for Architect
- “Patch minimal diff” prompt for Developer
- “Re-evaluate rubric” prompt for Critic
- “Regression / edge-case sweep” prompt for Tester

---

## 8. Failure mode injection (new showpiece capability)

### 8.1 Purpose

Turn the lab into a resilience demonstrator:

- show failures
- show detection
- show recovery
- show cost impact

### 8.2 Injection modes (v1.1)

- **Ambiguous spec**: remove/blur key constraints
- **Conflicting constraints**: intentionally contradict requirements
- **Truncated context**: simulate missing prior turns
- **Bad critic**: introduce incorrect critique or wrong rubric thresholds
- **Budget crunch**: set very low budget caps mid-run

### 8.3 Implementation concept

Injection modifies:

- scenario inputs
- routing prompts
- role templates
- budget parameters

LOC must record injection events in run artifact (`injections[]`).

---

## 9. Budget and economics (expanded)

### 9.1 Token estimation

- Estimate tokens from characters (baseline) and/or model-specific heuristics.
- Record per-turn estimate and cumulative.

### 9.2 Cost simulation

For v1.1 (no real API calls):

- user selects “pricing profile” presets (cheap / mid / premium)
- LOC computes simulated cost per turn and total
- show “what this would cost” with model tiers

### 9.3 Dashboard outputs

- burn-down chart over time
- per-role share of tokens/cost
- budget threshold warnings
- cost of drift (extra turns caused by drift recovery)

---

## 10. Visual Inspector UI (new, high impact)

### 10.1 Views

1. **Run Timeline**
   - turn list with role, timestamp, budget, validation, drift severity
2. **Turn Graph (DAG)**
   - nodes: turns
   - edges: handoffs / dependencies
   - highlights: drift, contract violations
3. **Diff View**
   - compare two turns (or two runs) for changes in constraints, artifacts, budgets
4. **Rubric Panel**
   - category scores and thresholds
   - reasons for pass/fail
5. **Injection Panel**
   - list and details of injected failures

### 10.2 UX principles

- No hidden magic. Every derived conclusion links to evidence.
- Export/import first-class.
- Works in iframe (no popups, no cross-origin dependencies).

---

## 11. Multi-model simulation layer (optional in v1.1)

### 11.1 Why

Prepare learners for API orchestration by teaching tradeoffs:

- latency
- cost
- reliability
- verbosity

### 11.2 How (without APIs)

Simulated Provider:

- assigns “model personality presets” to roles
- applies constraints (e.g., “fast model tends to be terse and miss edge cases”)
- introduces optional random error rates (seeded for determinism)

All simulation parameters must be recorded in the run artifact.

---

## 12. Tech stack and repo shape (static-first)

### 12.1 Proposed stack

- **TypeScript (strict)**
- **Vite** (static build)
- **React** (or Astro + React islands; choose one)
- **Zod** (schema validation)
- **Vitest** (tests)
- **ESLint + Prettier** (enforced)
- **Docker** for deterministic builds

### 12.2 Repo layout (proposed)

```
exnulla-orchestration-lab/
  apps/
    loc-web/                 # static web app
  packages/
    core/                    # state machine, schemas, scoring, drift
    scenarios/               # scenario definitions + injection templates
    ui/                      # inspector components
    cli/                     # optional CLI runner/export tools (v1.2+)
  runs/                      # sample runs (optional; or in /examples)
  docs/
    blueprint/               # this blueprint
    engineering-spec/        # detailed spec (separate doc)
    role-instructions/       # ChatGPT Project templates per role
  .github/workflows/
  Dockerfile
  package.json
  pnpm-workspace.yaml
```

### 12.3 Deterministic build requirements

- Inject `GIT_SHA` at build time (ARG + ENV)
- Include `meta/version.json` with git SHA and build timestamp (timestamp optional/normalized)
- Lockfile required (pnpm)
- CI must block merges if lint/test fail

---

## 13. Deployment and iframe embedding

### 13.1 Default deployment (standalone)

- Static build served by nginx or any static host
- Atomic deploy by swapping symlinked build directory

### 13.2 Iframe embedding (optional)

If embedded in `exnulla-site` or `exnulla-demos`:

- build outputs to a single folder root with relative assets
- no service-worker assumptions that conflict with host
- storage uses namespaced keys:
  - `exnulla.orchestrationLab.<runId>` etc.
- export/import uses file download/upload, not cross-window messaging

### 13.3 Integration contract (minimal)

- Provide a single embed URL (e.g., `/demos/orchestration-lab/index.html`)
- Provide a `postMessage`-optional integration later (v2+) but not required

---

## 14. Milestones

### v1.1.0 (Showpiece baseline)

- Core state machine + run artifact schema
- HumanProvider workflow
- Role contract enforcement + repair prompts
- Drift detection v1 (rules)
- Budget + cost dashboards (simulated)
- Inspector UI with DAG + timeline + rubric
- Failure injection panel + recorded injection events
- Export/import runs (JSON) + deterministic replay validation
- Docker + CI hygiene (lint/test/build)

### v1.2.x

- Scenario library expansion (3–6 scenarios)
- CLI utilities for run validation and report generation
- Run comparison tool (diff two runs)

### v2.x

- API provider adapters (optional)
- Tool execution hooks (optional)
- Multi-tenant “course mode” (optional)

---

## 15. Acceptance criteria

A v1.1 release is “done” when:

1. A learner can complete a guided run end-to-end using only copy/paste.
2. LOC validates role outputs against the schema and produces repair prompts.
3. Drift flags trigger reliably on injected failures.
4. Inspector clearly explains _why_ drift was flagged (evidence linked).
5. Exported run artifact can be imported and replay-validated deterministically.
6. Static build deploys cleanly and works in an iframe.
7. CI enforces strict TypeScript, linting, formatting, and tests.
8. `meta/version.json` exposes build SHA.

---

## 16. Notes on scope control

This is a showpiece, but it stays manageable by enforcing:

- Deterministic core first
- UI second (inspector)
- Scenario count limited in v1.1
- Simulation kept optional and seeded (no randomness without seed)

---

## 17. Deliverables (docs)

This blueprint implies the following docs in-repo:

- `docs/blueprint/exnulla-blueprint-orchestration-lab-1-1-0.md` (this file)
- `docs/engineering-spec/exnulla-engineering-spec-orchestration-lab-1-1-0.md` (next step)
- `docs/role-instructions/*.md` (ChatGPT Project templates)
- `docs/runbook/DEPLOY.md` (atomic static deploy)
- `docs/runbook/IFRAME.md` (embedding contract)

---

## 18. Repo naming rationale

**Recommended:** `exnulla-orchestration-lab`  
Signals “serious systems lab” rather than “toy demo,” while staying on-brand.

Alternate options:

- `exnulla-agentic-lab`
- `exnulla-orchestrator-lab`
- `exnulla-human-to-api-orchestration`
