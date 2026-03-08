# ExNulla Engineering Spec

## Human Agentic Orchestration Lab (Standalone Showpiece)

**Repository:** `exnulla-orchestration-lab`  
**Slug:** `orchestration-lab`  
**Spec Version:** 1.1.0  
**Blueprint:** `exnulla-blueprint-orchestration-lab-1-1-0.md`  
**Owner org:** `Thesis-Project`  
**Primary mode:** Static-first web app (iframe-safe)  
**Provider mode (v1.1):** Human transport + simulated provider (no APIs)  
**Last Updated (UTC):** 2026-02-27T00:00:00Z

---

## 0. Scope and determinism contract

### 0.1 What this spec is

An **implementation-grade** engineering spec for a standalone orchestration lab that:

- makes orchestration mechanics visible (role separation, routing, drift, budgets),
- captures every run as a deterministic **run artifact ledger** (`run.json`),
- provides an inspector UI (timeline, DAG, diffs, rubric, injections),
- supports export/import + deterministic replay validation,
- works in an iframe sandbox and deploys as an atomic static artifact.

This spec is written so it can be handed back later with: **“build it”** and executed with minimal drift.

### 0.2 Hard constraints (MUST)

1. **Static-first**: `pnpm build` outputs a static bundle that can be hosted by nginx / static host.
2. **Iframe-safe**: no popups, no cross-origin assumptions, no top-level navigation hacks.
3. **No UI automation/scraping**: human transport is manual by design.
4. **Deterministic core**: orchestration/state evaluation must be deterministic given the same inputs + responses.
5. **Export/import first-class**: runs are portable JSON artifacts; UI can import/export.
6. **No secrets**: browser build stores no API keys; v1.1 has no real provider calls.
7. **Repo hygiene**: TypeScript strict, ESLint + Prettier, tests, Docker deterministic build.

### 0.3 Non-goals (v1.1)

- Live integration with ChatGPT UI.
- Multi-user authentication / cloud persistence.
- Real API providers (OpenAI/Anthropic/etc.) beyond interface stubs.
- ML-based drift classification (rule-based + evidence only).

### 0.4 Deterministic replay guarantee (MUST)

Given:

- identical `scenarioId`,
- identical scenario inputs,
- identical injection set (including seed),
- identical agent responses pasted into the ledger,
- identical `schemaVersion`,
  then:
- validation results, drift flags, rubric scores, budget totals, and derived digests **MUST** match.

**Allowed non-determinism**:

- wall-clock timestamps can exist but MUST be excluded from deterministic checks (or normalized under export).

---

## 1. Product definition

### 1.1 Core workflows

1. **Create run**
   - user selects scenario, provider mode, seed, budget/cost profile, and optional injections.
2. **Generate routed prompt**
   - LOC produces a prompt for a role and explicit routing instructions.
3. **Human transport**
   - user executes prompt in the role’s ChatGPT Project and pastes the response into the LOC.
4. **Validate + score**
   - LOC validates schema/format, computes budgets/cost, flags drift, updates rubric, derives next step.
5. **Inspect**
   - user inspects timeline, graph, diffs, drift evidence, rubric reasoning, injection events.
6. **Export / Import**
   - export run as JSON (and optional markdown transcript); import later and replay-validate deterministically.
7. **Compare**
   - compare runs (or turns) via diff UI (v1.1: within one run; v1.2: cross-run).

### 1.2 Target user profiles

- Learner / developer wanting “pre-calc → calc” understanding of orchestration.
- Hiring reviewers assessing systems thinking + determinism discipline.
- Future-you using the ledger/state machine for API orchestration later.

---

## 2. Architecture overview

### 2.1 Packages (MUST)

- `packages/core`  
  Deterministic state machine, schemas, scoring, drift, budgets, providers, export/import, deterministic hashing.
- `packages/scenarios`  
  Scenario definitions, injection templates, seeded simulation knobs, scenario validation.
- `packages/ui`  
  Shared UI components (graph, diff, panels), pure/presentational where possible.
- `apps/loc-web`  
  Vite + React static web app: run wizard, prompt router, paste console, inspector.

### 2.2 Runtime boundaries

- All deterministic logic lives in `packages/core` and must be usable:
  - from the web app, and
  - from future CLI tooling (v1.2+).
- The web app is a thin shell around the core.

### 2.3 Transport / provider abstraction

- `HumanProvider` (v1.1): manual paste. Produces routing instructions only.
- `SimulatedProvider` (v1.1): produces deterministic “simulated outputs” for demonstration/testing, seeded.
- `ApiProvider` (v2+): stub interface only in v1.1 (no keys, no calls).

---

## 3. Tech stack and repo standards

### 3.1 Required stack (MUST)

- Node.js LTS (recommend 20.x)
- TypeScript `strict: true`
- pnpm + lockfile
- Vite + React (single-page app)
- Zod for runtime validation
- Vitest for unit/integration tests
- ESLint + Prettier enforced
- Docker for deterministic builds

### 3.2 Deterministic build provenance (MUST)

- Build accepts `ARG GIT_SHA` and injects to app:
  - `import.meta.env.VITE_GIT_SHA` (Vite) and/or `process.env.GIT_SHA` (tests/build scripts)
- Build outputs `meta/version.json` containing:
  - `gitSha`,
  - `schemaVersion`,
  - `buildId` (optional; may be derived deterministically from gitSha + package versions),
  - `builtAt` (optional; if present must be excluded from determinism checks).

---

## 4. Repository layout

### 4.1 Canonical layout (MUST)

```
exnulla-orchestration-lab/
  apps/
    loc-web/
      index.html
      vite.config.ts
      src/
        app/
          routes/
          state/
          components/
        main.tsx
      public/
        meta/
          version.json
  packages/
    core/
      src/
        schema/
        engine/
        providers/
        scoring/
        drift/
        budget/
        export/
        util/
      tests/
    scenarios/
      src/
        scenarios/
        injections/
        pricing/
      tests/
    ui/
      src/
        graph/
        diff/
        panels/
        widgets/
  docs/
    blueprint/
    engineering-spec/
    role-instructions/
    runbooks/
  examples/
    runs/
    scenarios/
  .github/
    workflows/
  Dockerfile
  docker-compose.yml (optional)
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml
  tsconfig.base.json
  eslint.config.js
  prettier.config.cjs
```

### 4.2 Git ignore rules

- Ignore persisted runs by default:
  - `apps/loc-web/.local/` (dev-only)
  - `**/runs/**` except `examples/runs/**`
- Include:
  - at least **one** sample run artifact in `examples/runs/` for regression tests and UI demo.

---

## 5. Data model: canonical run ledger

### 5.1 Canonical artifact path semantics

The canonical artifact is a single JSON object:

- **Web app storage**: stored in browser (IndexedDB preferred; localStorage acceptable for v1.1 with size limits)
- **Exported artifact**: user downloads a file named:
  - `orchestration-lab.run.<runId>.json`

When building a “runs folder” later (CLI), the canonical structure will be:

- `runs/<runId>/run.json` (not required for static build)

### 5.2 Schema versioning

- `schemaVersion` is a semver-like string, **pinned** to spec version for v1.1:
  - `"1.1.0"`
- Backward compatibility requirements:
  - v1.1 UI must import artifacts with `schemaVersion` `"1.1.0"`.
  - Future versions must provide migration utilities (v1.2+).

### 5.3 RunArtifact schema (MUST)

#### 5.3.1 Top-level

```ts
export type RunArtifact = {
  schemaVersion: '1.1.0';
  slug: 'orchestration-lab';
  gitSha: string; // injected at build; "unknown" allowed
  runId: string; // deterministic id format
  createdAt?: string; // ISO; optional for determinism checks
  updatedAt?: string; // ISO; optional for determinism checks

  mode: {
    provider: 'human' | 'simulated'; // v1.1
    simulation?: SimulationConfig; // if simulated
  };

  scenario: {
    scenarioId: string;
    version: string; // scenario version string, e.g. "1.0.0"
    inputs: Record<string, unknown>;
  };

  injections: InjectionEvent[]; // applied injections, deterministic order
  roles: RoleProfile[]; // role contracts + instructions metadata

  turns: Turn[]; // append-only
  derived: DerivedState; // regenerated deterministically

  budgets: BudgetLedger; // token estimates, warnings
  economics: EconomicsLedger; // simulated cost and profiles

  rubric: RubricLedger; // scoring + thresholds + evidence
  drift: DriftLedger; // flags + evidence + severity summary

  acceptance: {
    passed: boolean;
    reasons: string[];
    checklist: { item: string; status: 'pass' | 'fail' | 'unknown'; evidence?: string[] }[];
  };
};
```

#### 5.3.2 RoleProfile

```ts
export type RoleName = 'architect' | 'developer' | 'critic' | 'tester';

export type RoleProfile = {
  role: RoleName;
  displayName: string;
  chatgptProjectName: string; // user-configurable label
  instructionTemplateId: string; // e.g. "role-architect-1.1.0"
  contract: RoleContract;
};

export type RoleContract = {
  responseFormat: 'structured_markdown_v1' | 'json_v1';
  requiredHeaders: string[]; // exact heading strings
  requiredSections: string[]; // section ids
  forbiddenPatterns: string[]; // regex strings
  maxCodeBlockChars?: number; // heuristic for role confusion
  mustEchoRunTurnHeader: boolean; // require runId/turnId header block
};
```

#### 5.3.3 Turn

```ts
export type Turn = {
  turnId: number; // 1..n
  role: RoleName;

  prompt: {
    templateId: string; // prompt template key
    text: string;
    charCount: number;
    tokenEstimate: number;
    stateDigestHash: string; // hash of digest included in prompt
  };

  response: {
    text: string;
    charCount: number;
    tokenEstimate: number;
    parsed?: ParsedResponse; // result of parsing per contract
    contractValid: boolean;
    contractErrors: string[];
  };

  analysis: {
    driftFlags: DriftFlag[];
    rubricScore: RubricScore;
    notes: string[]; // deterministic, engine-generated notes only
  };

  timestamps?: { promptedAt: string; respondedAt: string }; // optional
};
```

#### 5.3.4 DerivedState (regenerated)

```ts
export type DerivedState = {
  digest: StateDigest; // compact state summary
  digestHash: string; // stable hash of digest
  openIssues: Issue[];
  artifactsIndex: ArtifactRef[];
  loopCountByStage: Record<string, number>;
  completion: { done: boolean; nextRole: RoleName | null; stage: Stage };
};
```

#### 5.3.5 Digest / issues / artifacts

```ts
export type Stage = 'kickoff' | 'implementation' | 'review' | 'test' | 'revise' | 'finalize';

export type StateDigest = {
  scenarioSummary: string; // scenario-provided summary, bounded
  constraints: string[]; // scenario constraints, stable order
  acceptanceCriteria: string[]; // stable order
  deliverables: string[]; // stable order
  lastDecisions: string[]; // last 3 decisions (deterministic extraction)
  openQuestions: string[]; // extracted from critic/tester
  artifactHints: string[]; // from dev outputs / plan sections
};

export type Issue = {
  id: string; // stable hash id
  severity: 'info' | 'warn' | 'error';
  source: 'critic' | 'tester' | 'engine';
  message: string;
  evidence: string[];
  open: boolean;
};

export type ArtifactRef = {
  id: string; // stable hash id
  kind: 'snippet' | 'filetree' | 'patch' | 'plan' | 'testplan';
  title: string;
  producedByTurnId: number;
  contentHash: string;
  excerpt: string; // bounded excerpt for UI
};
```

### 5.4 Deterministic hashing (MUST)

- Use a stable hash for digests, issues, artifacts:
  - `sha256(canonicalJsonString(value))`
- Canonical JSON stringification:
  - stable key ordering,
  - no whitespace variability,
  - arrays kept in order.

---

## 6. Scenario system

### 6.1 Scenario definition format (MUST)

Scenarios are authored as TypeScript objects in `packages/scenarios` and exported as a registry.

```ts
export type Scenario = {
  scenarioId: string; // e.g. "hello-orchestration"
  version: string; // semver string
  title: string;
  summary: string; // bounded summary
  description: string;

  constraints: string[]; // stable order
  acceptanceCriteria: string[]; // stable order
  deliverables: string[]; // stable order

  roleTemplates: {
    architect: PromptTemplateId;
    developer: PromptTemplateId;
    critic: PromptTemplateId;
    tester: PromptTemplateId;
  };

  initialInputsSchema: z.ZodTypeAny; // validates scenario inputs
  defaultInputs: Record<string, unknown>;

  rubricProfileId: string; // ties to rubric weights
};
```

### 6.2 Required scenarios (v1.1)

Ship **3** scenarios minimum (MUST), each designed to show different drift/failure types:

1. `hello-orchestration`  
   Simple deterministic task, emphasizes contracts + budgets.
2. `drift-trap-spec`  
   Ambiguous requirements; emphasizes clarification propagation and re-anchoring.
3. `regression-loop`  
   Forces test failures and revise loops; emphasizes loop caps and cost-of-drift.

### 6.3 Scenario determinism rules

- Scenario registry ordering must be stable (sort by `scenarioId`).
- Scenario inputs are validated and stored verbatim in run artifact.
- Any scenario-generated derived values must be stored or recomputable deterministically.

---

## 7. Role system and ChatGPT Project setup

### 7.1 Role instruction templates (MUST)

Ship templates in `docs/role-instructions/`:

- `architect.md`
- `developer.md`
- `critic.md`
- `tester.md`

Each template MUST contain:

- Mission
- Allowed outputs
- Forbidden actions
- Required response format contract
- Determinism rules (“no hallucinated filenames; state assumptions explicitly”)
- Interaction protocol for missing info (“ask targeted questions; do not proceed with guesses”)

### 7.2 Contract format: `structured_markdown_v1` (default)

All role responses MUST begin with an exact header block:

```
# Role: <Architect|Developer|Critic|Tester>
# Run: <runId>
# Turn: <turnId>
```

Then role-specific sections with fixed headings (examples below).
LOC must validate these headings (case-sensitive) as the contract baseline.

#### Architect required headings

- `## Constraints (Do Not Violate)`
- `## Acceptance Criteria (Checklist)`
- `## System Plan`
- `## Open Questions`
- `## Next Handoff`

#### Developer required headings

- `## Implementation Plan`
- `## Proposed File Tree`
- `## Patch / Diff`
- `## Notes for Critic`
- `## Next Handoff`

#### Critic required headings

- `## Contract Validation`
- `## Drift Signals`
- `## Rubric Scoring`
- `## Blocking Issues`
- `## Non-Blocking Suggestions`
- `## Next Handoff`

#### Tester required headings

- `## Test Plan`
- `## Test Results`
- `## Failures / Repro Steps`
- `## Risk Assessment`
- `## Next Handoff`

### 7.3 Repair prompts (MUST)

If a response fails contract validation:

- engine must generate a **repair prompt** for the same role that:
  - explicitly lists missing headings/fields,
  - instructs the role to rewrite in the required format,
  - forbids changing substantive content beyond formatting unless requested.

Repair events must be recorded as:

- a drift flag `DRIFT_CONTRACT_VIOLATION`,
- plus an engine note explaining the repair required.

---

## 8. Orchestration engine (state machine)

### 8.1 Engine API surface (MUST)

In `packages/core/src/engine/` implement:

```ts
export type EngineInput = {
  run: RunArtifact;
  event: EngineEvent;
};

export type EngineEvent =
  | { type: 'INIT_RUN'; scenarioId: string; inputs: Record<string, unknown>; config: RunConfig }
  | { type: 'PASTE_RESPONSE'; text: string }
  | { type: 'APPLY_INJECTION'; injectionId: string; params?: Record<string, unknown> }
  | { type: 'SET_BUDGET_CAP'; tokenEstimateCap: number }
  | { type: 'SET_PRICING_PROFILE'; profileId: string }
  | { type: 'RESET_TO_TURN'; turnId: number }; // optional v1.1, required v1.2

export type EngineOutput = {
  run: RunArtifact; // updated artifact
  next: {
    role: RoleName | null;
    stage: Stage;
    routingInstruction?: string;
    promptText?: string;
  };
  diagnostics: {
    contractErrors?: string[];
    driftFlags?: DriftFlag[];
    rubricScore?: RubricScore;
  };
};

export function stepEngine(input: EngineInput): EngineOutput;
```

### 8.2 Deterministic derivation pipeline (MUST)

On each `PASTE_RESPONSE`:

1. Identify expected role/stage from `run.derived.completion`.
2. Validate response contract; parse into `ParsedResponse`.
3. Compute charCount + tokenEstimate.
4. Run drift detection (rule-based) with evidence.
5. Run rubric scoring (rule-based) with evidence.
6. Update budgets + economics ledgers.
7. Derive `DerivedState` from all prior turns deterministically.
8. Choose next role/stage based on transition rules.

### 8.3 Transition rules (v1.1) (MUST)

- Stage progression:
  - `kickoff (architect)` → `implementation (developer)` → `review (critic)` → `test (tester)` → `finalize (architect)`
- Loops:
  - If critic finds blocking issues OR rubric score below threshold:
    - `review (critic)` → `revise (developer)` → `review (critic)`
  - If tester reports failures:
    - `test (tester)` → `revise (developer)` → `review (critic)` → `test (tester)` (as needed)
- Loop caps:
  - `maxReviseLoops` default: 5
  - if exceeded:
    - mark acceptance `passed=false`,
    - force `finalize (architect)` with reasons including loop cap triggered.

### 8.4 State digest regeneration (MUST)

Digest is regenerated from:

- scenario summary + constraints + acceptance criteria + deliverables,
- latest Architect “System Plan” section (bounded),
- open issues extracted from critic/tester sections (bounded),
- last 3 decisions extracted from “Next Handoff” sections.

Extraction rules must be deterministic and documented (regex-based with stable ordering).

---

## 9. Drift detection

### 9.1 Drift ledger schema

```ts
export type DriftLedger = {
  flags: DriftFlag[];
  maxSeverity: 'none' | 'info' | 'warn' | 'error';
  score: number; // weighted sum
};

export type DriftFlag = {
  id: string; // stable code
  severity: 'info' | 'warn' | 'error';
  message: string;
  turnId: number;
  evidence: string[]; // exact excerpts or rule hits
  category: 'contract' | 'role_boundary' | 'constraint' | 'scope' | 'budget' | 'consistency';
};
```

### 9.2 Required drift rules (v1.1)

**Contract**

- Missing required headings / header block
- Invalid run/turn header values (non-matching runId, non-integer turn)
- Unparseable structured sections

**Role boundary**

- Architect includes large code blocks over `maxCodeBlockChars` → warn
- Developer includes rubric scoring section → warn
- Critic proposes implementing code changes (not critique) → warn
- Tester proposes architecture changes (not test results) → warn

**Constraints**

- Mentions forbidden actions (scraping, secrets, automation, “I executed code”, etc.)
- Mentions external network calls if constraint forbids.

**Scope**

- Introduces new deliverables not in scenario deliverables
- Changes language/stack when constraints fix it

**Budget**

- Excess verbosity: response token estimate exceeds per-turn ceiling (configurable)
- Budget cap exceeded: error

**Consistency**

- Contradicts prior accepted constraints/decisions (simple text match + hash checks of constraint lists)

### 9.3 Drift scoring weights (MUST)

Provide a deterministic scoring table in code:

- `info = +1`
- `warn = +5`
- `error = +20`
  Plus per-category multipliers:
- contract ×1.0
- constraint ×1.5
- consistency ×1.2
- budget ×1.1
- scope ×1.3
- role_boundary ×1.0

---

## 10. Rubric scoring

### 10.1 Rubric ledger schema

```ts
export type RubricLedger = {
  profileId: string;
  thresholds: {
    overallPassScore: number; // e.g. 80
    maxAllowedDriftSeverity: 'warn' | 'error'; // default "warn"
    consecutivePassTurns: number; // default 2
  };
  scores: RubricScore[];
  lastTwoPass: boolean;
};

export type RubricScore = {
  turnId: number;
  role: RoleName;
  score: number; // 0..100
  breakdown: {
    completeness: number; // 0..25
    correctnessSignals: number; // 0..25
    constraintAdherence: number; // 0..25
    clarity: number; // 0..25
  };
  evidence: string[]; // bounded list
  notes: string[];
};
```

### 10.2 Deterministic scoring heuristics (MUST)

Each dimension uses deterministic signals:

- Completeness:
  - required headings present,
  - acceptance criteria referenced (architect + finalize turns),
  - deliverables addressed (developer).
- Correctness signals:
  - explicit assumptions list present when needed,
  - no contradiction flags,
  - critic/tester issues include reproduction/evidence.
- Constraint adherence:
  - no constraint drift flags,
  - no forbidden patterns.
- Clarity:
  - headings + bullet lists,
  - bounded verbosity,
  - actionable steps in “Next Handoff”.

Rubric code MUST output evidence that can be shown in the UI.

---

## 11. Budgeting and simulated economics

### 11.1 Token estimation (MUST)

- `tokenEstimate = ceil(charCount / 4)`
- Track:
  - per-prompt and per-response estimates,
  - cumulative totals,
  - per-role totals.

### 11.2 Budget ledger schema

```ts
export type BudgetLedger = {
  tokenEstimateCap?: number;
  used: number;
  usedByRole: Record<RoleName, number>;
  warnings: { atTurn: number; severity: 'info' | 'warn' | 'error'; message: string }[];
};
```

### 11.3 Warning thresholds (MUST)

If cap exists:

- 70% → warn
- 85% → warn
- 100% → error (require explicit “continue anyway” toggle in UI)

### 11.4 Cost simulation (MUST)

No real pricing calls. Provide local profile table:

```ts
export type PricingProfile = {
  profileId: string; // "cheap" | "mid" | "premium"
  title: string;
  promptPer1kTokensUSD: number;
  completionPer1kTokensUSD: number;
};

export type EconomicsLedger = {
  pricingProfileId: string;
  simulatedCostUSD: number;
  costByRoleUSD: Record<RoleName, number>;
  costByTurnUSD: Record<number, number>;
  costOfDriftUSD: number; // computed as cost of turns after first drift>=warn
};
```

---

## 12. Failure mode injection

### 12.1 Injection model (MUST)

Injections are deterministic transformations applied at run creation or mid-run.

```ts
export type InjectionEvent = {
  injectionId: string; // stable id
  appliedAtTurnId: number; // 0 for pre-run
  params: Record<string, unknown>;
  seed?: number; // if injection uses randomness
  description: string;
};
```

### 12.2 Required injection types (v1.1)

1. `AMBIGUOUS_SPEC`
   - removes acceptance criteria items or makes one vague.
2. `CONFLICTING_CONSTRAINTS`
   - injects contradictory constraint pair and forces architect re-anchor.
3. `TRUNCATED_CONTEXT`
   - engine includes fewer turn summaries in prompt generation.
4. `BAD_CRITIC`
   - simulated critic produces incorrect critique (sim provider only).
5. `BUDGET_CRUNCH`
   - lowers cap mid-run and forces recovery strategy.

### 12.3 Recording and evidence (MUST)

- Every injection must be recorded in `run.injections[]`.
- Drift detection must reference injections where relevant (“this failure was injected”).

---

## 13. Prompt generation

### 13.1 Prompt template requirements (MUST)

Prompt templates must be:

- deterministic,
- minimal history,
- always include the current `StateDigest` (bounded),
- explicitly state the role contract format.

### 13.2 Prompt generation algorithm (MUST)

- Input:
  - scenario definition,
  - current digest,
  - last N turns summaries (default N=2),
  - injections affecting prompts,
  - budget status.
- Output:
  - a single prompt string.

History inclusion MUST be bounded:

- include only:
  - digest,
  - last N summaries (generated deterministically from parsed role sections),
  - open issues list.

### 13.3 Prompt provenance

Store in each turn:

- `templateId`,
- included `digestHash` (so later we can prove prompt was generated from digest X),
- token estimates.

---

## 14. Persistence, export, import

### 14.1 In-browser persistence (v1.1)

Preferred: IndexedDB via a small wrapper (e.g. `idb` library) to store:

- run list metadata,
- full run artifacts.

Fallback: localStorage for metadata + compressed run JSON (only if small).

**Key namespace (MUST)**:

- `exnulla.orchestrationLab.*`
- include schemaVersion in keys where useful.

### 14.2 Export format (MUST)

- Export is the canonical `RunArtifact` JSON.
- Additionally export (optional):
  - `transcript.md` (prompt/response pairs),
  - `summary.md` (budgets, rubric, drift, acceptance checklist).

### 14.3 Import validation (MUST)

Import must:

- validate schemaVersion,
- validate Zod schema,
- recompute derived state and compare to stored derived (deterministic check),
- show any mismatches as “artifact integrity warnings.”

---

## 15. Inspector UI

### 15.1 Routes (MUST)

- `/` → landing + “New Run” + “Import Run”
- `/runs` → run list
- `/runs/:runId` → run overview (timeline)
- `/runs/:runId/turns/:turnId` → turn detail
- `/runs/:runId/graph` → DAG view
- `/runs/:runId/diff` → diff view (turn-to-turn)
- `/runs/:runId/rubric` → rubric panel
- `/runs/:runId/drift` → drift panel
- `/runs/:runId/injections` → injection panel
- `/meta/version.json` → version endpoint (static)

### 15.2 Timeline view requirements

- per turn:
  - role badge,
  - contract status,
  - token estimate + cumulative,
  - drift severity,
  - rubric score,
  - links to detail and diff.

### 15.3 DAG view requirements

- nodes = turns (ordered left-to-right by turnId)
- edges = inferred stage transitions / loops
- node styles:
  - contract invalid → highlight
  - drift warn/error → highlight
- click node opens turn detail

Implementation:

- use a lightweight graph lib compatible with static builds (e.g. React Flow) OR custom SVG layout.
- determinism requirement:
  - graph layout must be stable for a given run (seeded layout if using force algorithms).

### 15.4 Diff view requirements

Diff options:

- prompt vs prompt (two turns)
- response vs response
- digest vs digest across turns

Implementation:

- use a deterministic diff algorithm (e.g. `diff` package) and render hunks.

### 15.5 Paste console requirements

- shows expected role + stage
- shows prompt block (copy button)
- provides paste input area
- validates contract live and shows errors before submission
- submits through `stepEngine({ type: "PASTE_RESPONSE" })`

### 15.6 Accessibility / iframe constraints

- no reliance on `window.top` control
- all downloads via standard browser download; no popups
- no external fonts required (optional)

---

## 16. Simulated provider (optional but REQUIRED for tests)

### 16.1 Purpose

- Provide deterministic “agent outputs” for:
  - unit/integration tests,
  - demo mode without ChatGPT UI,
  - injecting failure patterns reproducibly.

### 16.2 SimulationConfig

```ts
export type SimulationConfig = {
  seed: number; // required
  modelPresetByRole: Record<RoleName, 'fast' | 'balanced' | 'thorough'>;
  errorRateByRole: Record<RoleName, number>; // 0..1
  verbosityByRole: Record<RoleName, number>; // 0..1
};
```

### 16.3 Simulation determinism rules

- Use a seeded PRNG (e.g. `seedrandom`) in core.
- Never use `Math.random()` directly.
- All simulated outputs must embed the run/turn header block and required headings.

---

## 17. Testing plan

### 17.1 Core unit tests (MUST)

- schema validation (valid + invalid fixtures)
- deterministic hashing + canonical json
- drift rules hit expected evidence
- rubric scoring stable given fixed input
- budget math and warning thresholds
- digest regeneration stable
- transition rules with loop caps

### 17.2 Integration tests (MUST)

- simulate an entire run with `SimulatedProvider`:
  - with no injections → should pass acceptance,
  - with each injection type → should flag drift and/or fail acceptance depending on design.

### 17.3 UI smoke tests (SHOULD)

- ensure build compiles
- ensure routes render with sample run artifact

---

## 18. CI and release hygiene

### 18.1 GitHub Actions (MUST)

Workflow steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. optional: upload `dist/` as artifact

### 18.2 Version stamping (MUST)

- `GIT_SHA` injected in CI:
  - `GIT_SHA=${{ github.sha }}`
- `meta/version.json` created during build from env + package version.

---

## 19. Docker spec (deterministic build)

### 19.1 Dockerfile requirements (MUST)

- multi-stage build (build → nginx or dist output)
- uses pnpm with lockfile
- accepts `ARG GIT_SHA`

Example (reference, adjust as needed):

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ARG GIT_SHA=unknown
ENV VITE_GIT_SHA=$GIT_SHA

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/loc-web/package.json apps/loc-web/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/scenarios/package.json packages/scenarios/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine AS runtime
COPY --from=build /app/apps/loc-web/dist /usr/share/nginx/html
```

### 19.2 Determinism note

Avoid embedding build timestamps unless explicitly excluded from replay checks.

---

## 20. Security and safety

### 20.1 No secrets rule (MUST)

- UI must warn: “Do not paste secrets; this tool stores data locally.”
- Best-effort secret detection (SHOULD):
  - regex for common token formats,
  - show warning banner; allow user to proceed (do not hard-block in v1.1).

### 20.2 Content boundaries

- Role templates must forbid:
  - claiming to have executed code,
  - scraping/automation,
  - accessing private systems.

---

## 21. Acceptance criteria (v1.1 release gate)

A v1.1.0 release is “done” when all are true:

1. New run wizard works end-to-end in Human mode using copy/paste.
2. Contract validation triggers and generates repair prompts.
3. Drift rules reliably fire on injected failure modes with evidence.
4. Inspector explains drift + rubric with clickable evidence.
5. Export/import roundtrip works and deterministic replay validation passes.
6. Static build runs cleanly and is iframe-safe.
7. CI enforces strict TS, lint, tests, build.
8. `/meta/version.json` exposes git SHA and schemaVersion.

---

## 22. Implementation checklist (file-level)

### 22.1 `packages/core` (MUST)

- `src/schema/runArtifact.ts` (types + zod)
- `src/util/canonicalJson.ts` (stable stringify)
- `src/util/hash.ts` (sha256 helpers)
- `src/engine/stepEngine.ts`
- `src/engine/deriveState.ts`
- `src/drift/rules/*.ts`
- `src/scoring/rubric.ts`
- `src/budget/budget.ts`
- `src/providers/humanProvider.ts`
- `src/providers/simulatedProvider.ts`
- `tests/*`

### 22.2 `packages/scenarios` (MUST)

- scenario registry + zod input schemas
- injection registry + deterministic transforms
- pricing profiles

### 22.3 `apps/loc-web` (MUST)

- run store (IndexedDB wrapper)
- new run wizard
- prompt router + paste console
- inspector routes (timeline, turn detail, graph, diff, rubric, drift, injections)
- export/import UI

### 22.4 `docs` (MUST)

- role instruction templates
- runbooks:
  - `DEPLOY.md` (atomic static deploy)
  - `IFRAME.md` (embedding contract and storage namespace)

---

## 23. Appendix A — Deterministic runId format

### 23.1 Format

Use a URL-safe id:

- `orl_<YYYYMMDD>_<hhmmss>_<randBase32>` for human runs (time-based, not determinism-critical), OR
- `orl_<hashPrefix>` for deterministic runs if seed-based.

**v1.1 choice (recommended):**

- time-based is acceptable because determinism is based on artifact content, not runId.

### 23.2 Requirement

- runId must be unique within local store.
- export file naming uses runId.

---

## 24. Appendix B — UI embed contract (iframe)

### 24.1 Static hosting assumptions

- all assets served relative to app root
- no service worker required
- no absolute URLs

### 24.2 Storage namespace

All keys must be prefixed:

- `exnulla.orchestrationLab.v1.1.0.*`

---

## 25. Roadmap hooks (v1.2+ / v2+)

### 25.1 v1.2 (planned)

- CLI validator:
  - `validate-run <file>`
  - `diff-runs <a> <b>`
- cross-run comparison UI
- more scenarios (6+)

### 25.2 v2 (planned)

- API provider adapters
- optional server runtime for keys (not in browser)
- tool execution hooks (optional)
