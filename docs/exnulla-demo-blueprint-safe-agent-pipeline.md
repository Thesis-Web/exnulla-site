# ExNulla Demo Blueprint — Safe Agent Pipeline (Spec‑Lint + Threat‑Sketch + PR Synthesis)

**Demo ID:** `safe-agent-pipeline`  
**Tier:** 2 (iframe-isolated demo artifact)  
**Primary audience takeaway:** _“This person ships AI features with production guardrails: schema gates, redaction, injection resistance, caching, budgets, and auditable traces.”_

This blueprint defines **what the demo is**, **what it must prove**, and **what it must ship**, grounded in the actual architecture in `the-thesis-chain-ai-devkit-main`.

---

## 0) Source of truth (existing code you already own)

This demo is a visualization + interactive runner over these files:

### Agents (3)

- `src/agents/spec-lint.agent.ts` — `runSpecLint(ctx)`
- `src/agents/threat-sketch.agent.ts` — `runThreatSketch(ctx)`
- `src/agents/pr-synthesis.agent.ts` — `runPRSynthesis(ctx)`

### Core pipeline (guardrails)

- `src/core/llm-client.ts` — **the** pipeline order:
  1. redaction
  2. injection guard (optional by policy)
  3. prompt envelope build
  4. cache check
  5. budget enforcement
  6. provider call (stub)
  7. parse + schema validate (fail closed)
  8. audit events (request/response)
- `src/core/schema.ts` — strict JSON parse + `Report` type gate
- `src/core/redaction.ts` — `DefaultRedactionRules` + `redact()`
- `src/core/injection-guards.ts` — `assertNoObviousPromptInjection()`
- `src/core/cache.ts` — memory cache interface + implementation
- `src/core/audit.ts` — structured audit events + console sink
- `src/core/policy.ts` — policy object (budgets, allowed/deny paths, strictSchema, injection guard)
- `src/core/prompt-templates.ts` — template discipline + schema reference
- `src/core/types.ts` — canonical types: `AgentContext`, `Report`, `Finding`, `LLMRequest/Response`
- `src/adapters/provider.stub.ts` — provider is intentionally stubbed (public-safe)

### Runner references (conceptual integration)

- `src/runners/local-runner.ts` — shows pipeline order and markdown rendering
- `src/runners/github-runner.ts` — shows intended GitHub automation pattern (optional narrative)

---

## 1) The product: what the demo does

A single-page app that lets a viewer **paste a PR diff + changed files** and run a **safe, schema-gated agent pipeline** with explicit toggles for guardrails.

**Inputs**

- Diff summary (string)
- Changed files (path + content), either:
  - paste/JSON import, or
  - multi-file editor, or
  - “load preset PR scenario”
- Optional “hostile injection attempt” content (embedded in diff or a file)

**Pipeline**

- Runs 3 agents in order (matching `local-runner.ts`):
  1. `ThreatSketchAgent` (conceptual threats + mitigations only)
  2. `SpecLint` (missing defs/ambiguity)
  3. `PRSynthesis` (advisory PR review)

**Outputs**

- A strict `Report` JSON per agent
- An audit timeline (request/response/cache/budget events)
- A “why this was blocked/allowed” explanation panel (especially for injection + schema errors)

---

## 2) Narrative hook (what the user learns in 60 seconds)

- “This is not ‘AI magic.’ It’s **a pipeline with safety rails**.”
- “Every output is **schema validated** before it becomes acceptable input.”
- “Before a provider call, we **redact** and **block obvious prompt injection**.”
- “We can prove repeatability and traceability through **prompt/context hashes** and audit events.”
- “Caching + budgets show operational maturity: predictable cost + bounded behavior.”

---

## 3) User stories

### Hiring manager / reviewer

- I can paste a PR diff and see useful findings with **strict JSON output**.
- I can toggle guardrails (redaction, injection guard, schema strictness, caching) and observe exactly what changes.
- I can see a structured audit trail (prompt hash, context hash, output hash) proving traceability.

### You (ExNulla)

- You can demo “safe agent engineering” without any real provider keys (stub provider is a feature).
- You can narrate security posture: fail-closed parsing, conservative injection heuristics, and path allow/deny policy.

---

## 4) Demo UX spec (wireframe-level)

### Global layout

- **Header**: Title + “Permalink” + “Reset” + “Presets”
- **3-column body**
  1. Inputs + Guardrails toggles
  2. Run controls + Agent outputs
  3. Audit timeline + Explanations

### Column 1 — Inputs

**PR Context**

- Repo ref: owner/name (string inputs)
- Prompt version (string input; default `1.0.0`)
- Diff summary (textarea)
- Changed files:
  - Table: path | size | actions (edit/delete)
  - File editor drawer (path + content)
  - Import/Export JSON (for permalinks and reproducibility)

**Hostile prompt injection**

- Toggle: “Inject hostile text into diff summary”
- Toggle: “Inject hostile text into first file”
- Textarea: injection payload (default preset includes patterns matched by `assertNoObviousPromptInjection`)

### Column 1 — Guardrails (policy panel)

These map directly to code concepts (some are demo-side toggles that wrap policy/options):

- **Enable redaction** (default ON)
  - Show active rules (from `DefaultRedactionRules`):
    - API key patterns → `sk-REDACTED`
    - emails → `EMAIL_REDACTED`
- **Enable prompt injection guard** (default ON)
  - Explain that guard scans system/task/constraints/diff/files material (mirrors `materialForGuard()` in `llm-client.ts`)
- **Enable schema gate (fail closed)** (default ON)
  - When OFF, show “unsafe mode” banner and still parse JSON, but skip Report validation (for demo comparison only)
- **Enable caching** (default ON)
  - Cache key preview:
    - `aidev:{provider}:{model}:{promptHash}:{contextHash}`
- **Budget settings** (default from `DefaultPolicy`)
  - maxCalls, maxTotalInputTokens, maxTotalOutputTokens
  - Display live counters during run
- **Path allow/deny** (default from `DefaultPolicy`)
  - allowPaths: `docs/`, `specs/`, `src/`, `pseudocode/`, `math/`
  - denyPaths: `.github/`, `secrets/`, `configs/`, `deploy/`
  - UI should flag files that violate policy (even though demo runner can still include them for educational effect)

### Column 2 — Run + Outputs

**Run controls**

- Button: **Run Pipeline**
- Button: “Run single agent” (dropdown: ThreatSketch / SpecLint / PRSynthesis)
- Checkbox: “Simulate bad provider output” (forces stub provider to return non-JSON or wrong schema, if implemented in demo adapter)

**Outputs**

- Tabs per agent:
  - “Rendered findings”
  - “Raw JSON report”
  - “Schema gate result” (pass/fail + reason)
- Findings table columns (from `Finding` type in `core/types.ts`):
  - id | severity | category | claim | evidence_refs | suggested_action

### Column 3 — Audit timeline + Explain

**Audit timeline**

- Structured event cards matching `AuditEvent` shape:
  - kind: `llm_request` / `llm_response` / `llm_error` / (demo-added) `cache_hit` / `cache_miss` / `redaction_applied` / `injection_blocked` / `budget_checked`
  - requestId
  - timestamp
  - provider, model
  - promptHash, contextHash, outputHash
  - usage (inputTokens/outputTokens)
- Visual grouping by agent run

**Explain panel**

- “What got redacted and why” (diff view)
- “Why injection was blocked” (show matching regex name, e.g. `/ignore\s+previous\s+instructions/i`)
- “Why schema gate failed” (JSON parse error vs Report validation error)
- “Why caching hit/missed” (cache key + TTL)

---

## 5) Determinism + reproducibility contract

This demo must be reproducible with a permalink and export/import.

### 5.1 Permalink contract

A permalink must encode the full demo state:

- inputs: repo, promptVersion, diffSummary, changedFiles[]
- injection payload + where it is injected
- guardrail toggles + budget numbers
- UI options: selected agent tab, show/hide panels

**Requirement:** opening the permalink in a fresh browser and clicking “Run Pipeline” produces identical:

- requestIds (they are derived from `promptVersion` + `sha256(diffSummary)` in agents)
- prompt/context hashes (assuming same prompt envelope builder)
- cache key (if enabled)
- outputs (given stub provider determinism)

### 5.2 Hashes

Use the same hashing approach as the devkit (`sha256` in `src/core/util.ts`) for:

- requestId components (already in agents)
- promptHash, contextHash, outputHash display

**Important:** The demo must show the **exact prompt envelope** being hashed:

- `SYSTEM: ...`
- `TASK: ...`
- `CONSTRAINTS: ...`
- `OUTPUT_SCHEMA: ...`
- `CONTEXT_DIFF_SUMMARY: ...`
- `CONTEXT_FILES: ...`

This is how you sell “versioned prompt discipline.”

---

## 6) Data model for demo state

Conceptual state shape (BigInt not required here; standard JSON OK):

```ts
type SafeAgentDemoState = {
  repo: { owner: string; name: string };
  promptVersion: string;

  diffSummary: string;
  changedFiles: Array<{ path: string; content: string }>;

  injection: {
    enabled: boolean;
    where: 'none' | 'diffSummary' | 'firstFile' | 'both';
    payload: string;
  };

  guardrails: {
    redaction: boolean;
    injectionGuard: boolean;
    strictSchema: boolean;
    caching: boolean;
    policy: {
      allowPaths: string[];
      denyPaths: string[];
      budget: { maxCalls: number; maxTotalInputTokens: number; maxTotalOutputTokens: number };
      model: { provider: string; model: string; temperature: number; maxOutputTokens: number };
    };
  };

  ui: {
    activeAgent: 'pipeline' | 'ThreatSketchAgent' | 'SpecLint' | 'PRSynthesis';
    showPromptEnvelope: boolean;
    showDiffAfterRedaction: boolean;
  };
};
```

---

## 7) Preset scenarios (must ship with v1)

Each preset should be “demo-safe” (no real secrets) but still realistic.

### Preset A — Clean PR (baseline)

- diffSummary: normal feature change
- 2–3 files in `src/` and `docs/`
- guardrails ON
- Expected: all 3 reports parse and validate; findings mostly `info/warn`

### Preset B — Prompt injection attempt (blocked)

- injection enabled with payload containing:
  - “ignore previous instructions”
  - “SYSTEM: …”
  - “reveal secrets”
- guardrails ON
- Expected: pipeline stops at injection guard with a clear error banner + audit event

### Preset C — Redaction demonstration

- include `sk-...`-looking token and an email in the diff/file
- redaction ON
- Expected: before/after view shows replacement strings; audit notes “redaction_applied”

### Preset D — Schema gate failure (fail closed)

- simulate provider returning non-JSON or wrong shape
- strictSchema ON
- Expected: schema error displayed; run marked failed; no “unsafe” outputs presented as valid

### Preset E — Cache hit (operational discipline)

- caching ON
- run once (cache miss), run again (cache hit)
- Expected: second run returns instantly with cache hit event; hashes identical

### Preset F — Path policy flags

- include a file with path `.github/workflows/…` or `deploy/…`
- Expected: UI flags policy violation; explain allow/deny logic; (optional) allow user to exclude flagged files

---

## 8) What the demo must output (artifacts)

### 8.1 Agent outputs (copyable)

- JSON `Report` per agent (exact shape from `src/core/types.ts`)
  - agent, version, input_hash, output_hash, findings[], notes?

### 8.2 Audit outputs (copyable)

- Exportable JSON array of audit events (including demo-added “cache_hit” etc.)
- Each event includes hashes and usage

### 8.3 “Rendered report” markdown (optional, mirrors local runner)

- Similar to `renderMarkdown()` in `src/runners/local-runner.ts`
- Useful for a screenshot + PR-comment narrative

---

## 9) Quality gates (acceptance tests)

### Guardrail correctness tests

1. **Injection blocked**

- With injection guard ON, payload containing `ignore previous instructions` must throw and stop run.

2. **Injection allowed (demo unsafe mode)**

- With injection guard OFF, pipeline proceeds (but should show a yellow “unsafe mode” banner).

### Schema correctness tests

1. Non-JSON provider output → “LLM output is not valid JSON”
2. JSON but wrong shape → “failed Report validation”
3. Correct shape → pass

### Caching tests

- Same inputs + guardrails → cache hit with identical hashes
- Any change in diff summary or file content → cache miss (contextHash changes)

### Budget tests

- Exceed maxCalls triggers “Budget exceeded: maxCalls”
- Demonstrate counters in UI (calls/inTok/outTok)

### Determinism tests

- Export state → import → run → identical outputs
- Permalink → private window → run → identical outputs

---

## 10) Implementation checkpoints (for the engineering spec)

### Checkpoint A — Demo-core wrapper

Create a demo-local wrapper that mirrors devkit structure:

- construct `AgentContext` from UI state
- configure `createLLMClient()` with:
  - (demo) in-memory cache
  - (demo) audit sink that writes to an in-app store instead of console
  - stub provider adapter (or a demo provider that can intentionally fail)

### Checkpoint B — Deterministic prompt envelope display

- render the final prompt envelope exactly as `buildPrompt()` does
- show promptHash/contextHash

### Checkpoint C — UI ergonomics

- fast, readable findings table
- collapsible raw JSON blocks
- audit timeline grouped by agent run

### Checkpoint D — Static build constraints

- Vite + TS strict
- no network required
- no secrets required (explicitly position this as a design posture demo)

---

## 11) Deliverables (what ships in ExNulla)

- `demos/safe-agent-pipeline/` (built artifact path)
- `meta.json` (for ExNulla Lab indexing):
  - id, title, tier, source_repo, source_paths[], commit_sha, tags[]
- Screenshot for Lab tile (audit timeline visible)
- Short walkthrough clip:
  - baseline run → injection blocked → cache hit → schema fail closed

---

## 12) Hard constraints (portfolio-grade)

- **Never** display anything that looks like real secrets; ensure presets are synthetic.
- **Fail closed** by default: if schema fails, do not render “findings” as if valid.
- The demo must make it obvious which guardrails are active and why.
- The demo should be understandable in under 2 minutes without reading code.

---

## Appendix A — Canonical `Report` + `Finding` shapes (from `src/core/types.ts`)

```ts
type Finding = {
  id: string;
  severity: 'info' | 'warn' | 'high';
  category: 'structure' | 'invariant' | 'threat' | 'diff' | 'test';
  claim: string;
  evidence_refs: string[];
  suggested_action?: string;
};

type Report = {
  agent: string;
  version: string;
  input_hash: string;
  output_hash: string;
  findings: Finding[];
  notes?: string[];
};
```

---

## Appendix B — Key “safety rails” mapped to code

- **Redaction**: `applyRedaction()` in `src/core/llm-client.ts` uses `DefaultRedactionRules`
- **Injection guard**: `assertNoObviousPromptInjection(materialForGuard(req))`
- **Schema gate**: `parseAndValidateReport(res.rawText, req.outputSchema)` fail closed
- **Cache**: `createMemoryCache()` + `cacheKey = aidev:{provider}:{model}:{promptHash}:{contextHash}`
- **Audit**: `AuditEvent` emitted as `llm_request` and `llm_response` with hashes + usage
- **Budget**: `enforceBudget()` bounded calls + tokens (demo shows counters)
