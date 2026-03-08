# The Thesis Chain AI DevKit — Engineering Specification

**Version:** `1.0.0`  
**Status:** Canonical Engineering Specification  
**Project:** `the-thesis-chain-ai-devkit`  
**Document Type:** Engineering Specification  
**Primary Audience:** Implementation engineers, reviewers, maintainers, CI/CD operators  
**Depends On:** `the-thesis-chain-ai-devkit-blueprint-1-0-0.md`

---

## 1. Specification Intent

This engineering specification defines the concrete implementation contract for the Thesis Chain AI DevKit.

It exists to translate blueprint-level architectural intent into:

- module boundaries
- runtime data contracts
- algorithmic flow
- validation rules
- budget equations
- cache semantics
- audit event structure
- runner behavior
- GitHub integration behavior
- acceptance tests

This spec is written so an implementation engineer can build or extend the system without guessing.

---

## 2. System Summary

The DevKit is a provider-agnostic, schema-gated, guardrail-first framework for AI-assisted engineering workflows.

At runtime, the system:

1. receives a task-specific request
2. filters context by policy
3. redacts content
4. screens for prompt injection
5. assembles a prompt envelope
6. computes deterministic hashes
7. checks cache
8. enforces budget
9. calls a provider adapter
10. parses and validates response structure
11. records audit events
12. returns an advisory report to a runner

The implementation must preserve that order.

---

## 3. Repository-Level Module Topology

### 3.1 Required top-level module groups

- `src/core/`
  - types
  - policy
  - redaction
  - injection guards
  - schema validation
  - LLM client
  - audit
  - cache
  - prompt templates
  - shared utilities

- `src/adapters/`
  - provider adapter interface
  - provider implementations or stubs

- `src/agents/`
  - typed agent runners for fixed task classes

- `src/runners/`
  - local execution path
  - GitHub-oriented execution path

- `docs/`
  - architectural and operational documentation

- `.github/workflows/`
  - CI demonstration or integration flows

---

## 4. Data Contracts

### 4.1 Severity

Allowed values:

- `info`
- `warn`
- `high`

### 4.2 Category

Allowed values:

- `structure`
- `invariant`
- `threat`
- `diff`
- `test`

### 4.3 Finding

A finding is a typed advisory unit.

```ts
type Finding = {
  id: string;
  severity: 'info' | 'warn' | 'high';
  category: 'structure' | 'invariant' | 'threat' | 'diff' | 'test';
  claim: string;
  evidence_refs: string[];
  suggested_action?: string;
};
```

### 4.4 Report

The report is the canonical accepted AI output structure.

```ts
type Report = {
  agent: string;
  version: string;
  input_hash: string;
  output_hash: string;
  findings: Finding[];
  notes?: string[];
};
```

### 4.5 FileBlob

```ts
type FileBlob = {
  path: string;
  content: string;
};
```

### 4.6 AgentContext

```ts
type AgentContext = {
  repo: { owner: string; name: string };
  pr?: { number: number; headSha: string };
  diffSummary: string;
  changedFiles: FileBlob[];
  promptVersion: string;
};
```

### 4.7 ModelSpec

```ts
type ModelSpec = {
  provider: 'stub' | 'openai' | 'azure_openai' | 'anthropic' | 'vertex';
  model: string;
  temperature: number;
  maxOutputTokens: number;
};
```

### 4.8 Budget

```ts
type Budget = {
  maxCalls: number;
  maxTotalInputTokens: number;
  maxTotalOutputTokens: number;
};
```

### 4.9 LLMRequest

```ts
type LLMRequest = {
  requestId: string;
  system: string;
  task: string;
  constraints: readonly string[];
  outputSchema: JSONSchemaLike;
  model: ModelSpec;
  context: {
    diffSummary: string;
    files: FileBlob[];
  };
  sampling?: {
    top_p?: number;
    seed?: number;
  };
};
```

### 4.10 LLMResponse

```ts
type LLMResponse = {
  requestId: string;
  provider: LLMProvider;
  model: string;
  rawText: string;
  parsed: Report;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  audit: {
    promptHash: string;
    contextHash: string;
    outputHash: string;
    timestampMs: number;
  };
};
```

---

## 5. Policy Contract

### 5.1 Policy structure

The system policy must declare:

- `allowPaths`
- `denyPaths`
- `budget`
- `model`
- `strictSchema`
- `promptInjectionGuard`

Example contract:

```ts
type Policy = {
  allowPaths: string[];
  denyPaths: string[];
  budget: Budget;
  model: ModelSpec;
  strictSchema: true;
  promptInjectionGuard: true;
};
```

### 5.2 Path evaluation rule

A path is eligible iff:

1. it does not match any deny prefix
2. it does match at least one allow prefix

Formally, for path `p`:

`eligible(p) = (forall d in D : not startsWith(p, d)) and (exists a in A : startsWith(p, a))`

Where:

- `D` = deny path set
- `A` = allow path set

### 5.3 Default posture

The default policy must remain conservative and read-only in operational effect.

---

## 6. Request Lifecycle

### 6.1 Required order of execution

The system shall process each request in this exact logical order:

1. accept typed request
2. apply redaction
3. run prompt injection preflight
4. build prompt
5. hash prompt and context
6. check cache
7. enforce budget
8. record request audit event
9. call provider
10. parse response
11. validate response schema
12. increment budget counters
13. compute output hash
14. record response audit event
15. write cache entry
16. return structured response

This order is not optional. Rearranging it weakens safety or observability.

---

## 7. Context Reduction Requirements

### 7.1 Context assembly

Only changed files relevant to the current task may be included.

### 7.2 Context size discipline

The system must avoid whole-repo context assembly. Input is restricted to:

- diff summary
- selected changed files
- fixed prompt template material
- fixed constraints

### 7.3 Exclusion rules

Files matching deny policy shall never be passed to a provider.

### 7.4 Context objective

The context subsystem is optimized for signal density, not completeness.

---

## 8. Redaction Requirements

### 8.1 Redaction timing

Redaction must occur before cache-key generation for provider-bound prompt content and before provider invocation.

### 8.2 Minimum baseline patterns

The implementation must support rule-based redaction of:

- obvious API-key-like tokens
- email addresses
- later extensible secret patterns

### 8.3 Redaction function

For text blob `x` and rule set `R = {r_1, r_2, ..., r_n}`:

`Redact(x, R) = r_n(...r_2(r_1(x)))`

Where each `r_i` is a pattern substitution function.

### 8.4 Redaction philosophy

The redaction subsystem is deliberately conservative. False positives are acceptable if they reduce accidental disclosure.

---

## 9. Prompt Injection Guard Requirements

### 9.1 Guard timing

Prompt injection screening must run after redaction and before provider invocation.

### 9.2 Heuristic scope

The system must reject obvious adversarial prompt constructs such as:

- instruction override attempts
- role-spoof labels
- secret-exfiltration requests
- provider-key disclosure language

### 9.3 Safety mode

The guard should prefer false positive rejection over permissive acceptance.

### 9.4 Failure behavior

A triggered guard produces immediate request rejection.

---

## 10. Prompt Envelope Construction

### 10.1 Required sections

The prompt envelope shall be assembled in explicit labeled sections:

- `SYSTEM`
- `TASK`
- `CONSTRAINTS`
- `OUTPUT_SCHEMA`
- `CONTEXT_DIFF_SUMMARY`
- `CONTEXT_FILES`

### 10.2 Section purpose

This labeling exists to reduce ambiguity, constrain prompt shape, and make prompt assembly auditable.

### 10.3 Prompt template versioning

Every prompt template must include:

- `id`
- `version`
- `system`
- `task`
- `constraints`
- `outputSchema`

Template version changes are behavioral changes and must be traceable.

---

## 11. Hashing and Cache Semantics

### 11.1 Prompt hash

Let `P` be the final assembled prompt string. Then:

`promptHash = H(P)`

### 11.2 Context hash

For diff summary `S` and files `F = {(p_i, c_i)}`:

`contextHash = H(S || join_i(p_i || ":" || H(c_i)))`

### 11.3 Cache key

A canonical cache key shall include:

- policy namespace or equivalent
- provider
- model
- prompt hash
- context hash

Example:

`cacheKey = "aidev:" || provider || ":" || model || ":" || promptHash || ":" || contextHash`

### 11.4 Cache objective

Caching exists to prevent repeated spend on semantically equivalent work.

### 11.5 Cache store requirement

The cache interface must support:

- `get(key)`
- `set(key, value, ttlSeconds)`

The reference implementation may be in-memory. Production implementations may use external stores.

---

## 12. Budget Enforcement

### 12.1 Runtime counters

For a process-local runtime:

- `c` = calls made
- `ti` = cumulative input tokens
- `to` = cumulative output tokens

### 12.2 Enforcement predicates

A request is permitted iff:

- `c < C_max`
- `ti < I_max`
- `to < O_max`

If any predicate fails, the run must reject with an explicit budget error.

### 12.3 Budget enforcement timing

Budget checks occur before provider invocation.

### 12.4 Increment semantics

Counters are incremented only after a provider response is received.

### 12.5 Operational note

Process-local counters are sufficient for local/demo runs. Shared production environments may require durable or distributed budget state.

---

## 13. Provider Adapter Contract

### 13.1 Provider adapter purpose

The provider adapter isolates model-vendor specifics from core pipeline logic.

### 13.2 Minimum interface

The adapter must expose a call surface equivalent to:

```ts
interface ProviderAdapter {
  provider: LLMProvider;
  call(
    req: LLMRequest,
    prompt: string,
  ): Promise<{
    provider: LLMProvider;
    model: string;
    rawText: string;
    usage: { inputTokens: number; outputTokens: number };
  }>;
}
```

### 13.3 Stub provider

A stub provider shall be supported for:

- public skeletons
- offline demos
- deterministic test harnesses
- safe CI demonstrations

### 13.4 Provider principle

The provider is replaceable. Core safety posture may not depend on proprietary provider behavior.

---

## 14. Schema Validation Boundary

### 14.1 Boundary definition

The schema boundary is the point where raw model text may become acceptable structured input.

### 14.2 Required behavior

The system must:

1. parse raw text as JSON
2. validate the resulting object as a `Report`
3. reject malformed or invalid output

### 14.3 Structural validity vs correctness

Schema validity only means structure is acceptable. It does not certify truth, completeness, or sound reasoning.

### 14.4 Failure mode

Invalid JSON or invalid report structure must terminate the request as failure.

---

## 15. Audit Event Requirements

### 15.1 Event classes

At minimum, audit must support:

- `llm_request`
- `llm_response`
- `llm_error`

### 15.2 Minimum request event fields

- `kind`
- `requestId`
- `timestampMs`
- `provider`
- `model`
- `promptHash`
- `contextHash`

### 15.3 Minimum response event fields

- all request event fields
- `outputHash`
- `usage`

### 15.4 Minimum error event fields

- all request event fields where available
- error name
- error message

### 15.5 Structured emission

Audit events must be machine-ingestible, preferably JSON-structured.

---

## 16. Agent Implementation Requirements

### 16.1 Agent contract

Each agent must:

- create an `LLMRequest`
- bind to a versioned template
- supply a concrete model spec
- pass typed context
- return `Report`

### 16.2 Required current agent classes

- `SpecLint`
- `PRSynthesis`
- `ThreatSketch`

### 16.3 ThreatSketch special constraint

ThreatSketch must remain conceptual. It may classify risks and mitigations, but may not output exploitation steps.

### 16.4 Agent determinism rule

Agents may vary in prompt content and task definition, but not in core safety boundary behavior.

---

## 17. Runner Requirements

### 17.1 Local runner

The local runner must support demonstration execution using fixed example context and render advisory markdown.

### 17.2 GitHub runner

The GitHub runner must model or implement:

- webhook signature verification
- PR metadata extraction
- installation token acquisition or workflow-token use
- changed-file retrieval
- path eligibility filtering
- pipeline execution
- advisory PR comment rendering

### 17.3 GitHub safety requirement

The GitHub path must default to read-only review surfaces such as comments or checks. It must not imply merge authority.

---

## 18. GitHub App / Webhook Model

### 18.1 Signature verification

Webhook-driven operation requires deterministic verification of the GitHub signature before processing payload content.

### 18.2 Installation token minting

If operating as a GitHub App, installation tokens must be minted per installation and scoped minimally.

### 18.3 Changed-file fetching

Only PR files relevant to the advisory pipeline may be fetched.

### 18.4 Policy application

Fetched files must be filtered by policy prior to downstream use.

### 18.5 Comment rendering

Rendered comments should state clearly that the result is advisory and schema-gated, not authoritative.

---

## 19. Pseudocode

### 19.1 Core request pipeline

```text
function INVOKE(req, policy, cache, audit, provider):
    redactedReq = APPLY_REDACTION(req)

    if policy.promptInjectionGuard == true:
        ASSERT_NO_PROMPT_INJECTION(MATERIAL_FOR_GUARD(redactedReq))

    prompt = BUILD_PROMPT(redactedReq)

    promptHash  = HASH(prompt)
    contextHash = HASH_CONTEXT(redactedReq.context)
    cacheKey    = BUILD_CACHE_KEY(policy, redactedReq.model, promptHash, contextHash)

    if cache exists:
        hit = cache.get(cacheKey)
        if hit exists:
            return hit

    ENFORCE_BUDGET(policy.budget)

    audit.record(REQUEST_EVENT(...))

    try:
        raw = provider.call(redactedReq, prompt)
        parsed = PARSE_AND_VALIDATE(raw.rawText, redactedReq.outputSchema)

        UPDATE_RUNTIME_COUNTERS(raw.usage)

        outputHash = HASH(JSON.stringify(parsed))

        response = BUILD_RESPONSE(parsed, raw, promptHash, contextHash, outputHash)

        audit.record(RESPONSE_EVENT(...))

        if cache exists:
            cache.set(cacheKey, response, ttlSeconds)

        return response

    catch err:
        audit.record(ERROR_EVENT(...))
        raise err
```

### 19.2 Path eligibility

```text
function IS_ALLOWED_PATH(path, allowPaths, denyPaths):
    for d in denyPaths:
        if path startsWith d:
            return false

    for a in allowPaths:
        if path startsWith a:
            return true

    return false
```

### 19.3 Agent runner pattern

```text
function RUN_AGENT(agentTemplate, ctx):
    req = {
        requestId: BUILD_REQUEST_ID(agentTemplate, ctx),
        system: agentTemplate.system,
        task: agentTemplate.task,
        constraints: agentTemplate.constraints,
        outputSchema: agentTemplate.outputSchema,
        model: SELECT_MODEL(agentTemplate),
        context: {
            diffSummary: ctx.diffSummary,
            files: ctx.changedFiles
        }
    }

    res = LLM_CLIENT.invoke(req)
    return res.parsed
```

---

## 20. Evaluation and Metrics

### 20.1 Primary evaluation principle

The system must be evaluated by engineering outcomes, not token volume.

### 20.2 Suggested metrics

- reduction in human review time
- number of ambiguities caught before merge
- contradiction detection rate
- false positive rate
- structured output acceptance rate
- cache hit rate
- provider failure rate
- rejected unsafe-context rate
- budget-overrun frequency
- audit completeness rate

### 20.3 Quality lens

A system that spends fewer tokens but leaks secrets or produces unactionable noise is not successful.

---

## 21. Security Requirements

### 21.1 Secrets

Secrets must never be intentionally included in provider-bound prompt context.

### 21.2 PII

PII-bearing material must be excluded or redacted according to policy.

### 21.3 Write access

Write-capable automation must remain disabled unless explicitly approved and separately reviewed.

### 21.4 Supply chain

Dependencies used in CI or webhook execution should be minimal, pinned where appropriate, and reviewable.

### 21.5 Output treatment

Even validated output must remain advisory unless a separate deterministic control layer explicitly promotes a subset of behavior.

---

## 22. Failure Modes and Required Handling

### 22.1 Prompt injection guard triggered

Result: reject request, record error audit event.

### 22.2 Path not allowed

Result: exclude file or reject run depending on runner policy.

### 22.3 Redaction alters material significantly

Result: continue if structure remains usable; otherwise surface limited-result state.

### 22.4 Cache unavailable

Result: continue without cache if safety posture is preserved.

### 22.5 Budget exceeded

Result: reject before provider invocation.

### 22.6 Provider failure

Result: record error audit event and surface failure.

### 22.7 Invalid JSON

Result: reject response.

### 22.8 Schema mismatch

Result: reject response.

### 22.9 Audit sink failure

Preferred result: surface operational error; do not silently claim successful audit if audit failed.

---

## 23. Test Requirements

### 23.1 Unit tests

Minimum expected unit coverage should include:

- path policy evaluation
- redaction substitution
- prompt injection heuristics
- prompt assembly
- schema validation success/failure
- budget enforcement
- cache hit/miss behavior
- audit event formatting

### 23.2 Integration tests

Minimum expected integration coverage should include:

- local runner end-to-end with stub provider
- GitHub runner path filtering
- advisory comment rendering
- invalid response rejection path

### 23.3 Security-oriented tests

Minimum adversarial test cases should include:

- injected override strings in diffs
- secret-like material in changed files
- denylisted paths in PR file lists
- malformed JSON responses
- structurally valid but empty reports

---

## 24. CI/CD Expectations

### 24.1 CI role

CI is used to verify deterministic correctness around the DevKit itself, not to treat model output as a release authority.

### 24.2 CI checks

Expected checks include:

- formatting
- linting
- type checking
- unit tests
- integration tests where safe
- workflow syntax validation

### 24.3 Public skeleton safety

In public or demonstration contexts, provider calls should remain stubbed unless explicitly configured otherwise.

---

## 25. Acceptance Criteria

Implementation satisfies this spec when all of the following are true:

- typed requests can be constructed and executed
- policy-based path filtering works as specified
- redaction executes before provider call
- prompt injection screening can reject suspicious content
- prompt envelopes are assembled in labeled sections
- prompt and context hashes are generated deterministically
- cache hits bypass provider calls
- budget enforcement blocks overrun conditions
- provider adapters can be swapped without changing core logic
- invalid JSON responses are rejected
- invalid report structures are rejected
- audit events are emitted for request/response/error paths
- agents return structured reports
- local runner can produce advisory markdown
- GitHub runner can model or execute advisory PR workflow safely
- no code path grants implicit merge or deploy authority to AI output

---

## 26. Implementation Notes

### 26.1 Public skeleton vs production implementation

The current repository may use lightweight validators, in-memory cache, and stub provider surfaces. That is acceptable for the public skeleton. Production-hardening may replace those internals without changing the architectural contract defined here.

### 26.2 Behavioral invariants that must not drift

The following invariants are mandatory:

- AI output remains advisory
- deterministic validation remains authoritative
- provider access happens only after safety preflight
- schema failure rejects output
- budget is bounded
- path policy is enforced
- audit remains structured
- read-only is the default integration posture

---

## 27. Summary

This engineering specification defines an AI-assisted engineering framework that is useful precisely because it is constrained.

The system is not valuable when it is permissive. It is valuable when it is:

- structured
- bounded
- reviewable
- cheap enough to operate
- difficult to misuse
- explicit about authority

That is the implementation contract for the Thesis Chain AI DevKit.
