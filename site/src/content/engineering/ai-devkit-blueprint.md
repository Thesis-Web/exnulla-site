# The Thesis Chain AI DevKit — Blueprint

**Version:** `1.0.0`  
**Status:** Canonical Blueprint  
**Project:** `the-thesis-chain-ai-devkit`  
**Document Type:** System Blueprint  
**Primary Audience:** Engineering leadership, platform engineers, security reviewers, implementation engineers  
**Authoring Intent:** Define the operational architecture, trust boundaries, guardrails, authority model, and implementation shape for a safe AI-assisted engineering system.

---

## 1. Purpose

The Thesis Chain AI DevKit exists to integrate AI-assisted development into real engineering workflows without giving model output uncontrolled authority over code, repository state, infrastructure, or policy.

The system is designed around a simple premise:

**AI output is useful, but untrusted.**

The DevKit therefore does not treat the model as a builder with implicit authority. It treats the model as an external probabilistic subsystem wrapped inside deterministic engineering controls. The value of the system comes from how inputs are reduced, how context is bounded, how outputs are validated, how budget is controlled, how risk is isolated, and where human authority is retained.

This project is not a chatbot wrapper. It is an engineering control framework for structured, auditable, bounded AI-assisted workflows.

---

## 2. Problem Statement

Modern model providers can accelerate review, synthesis, linting, threat sketching, and ambiguity detection. However, naive adoption creates a compound engineering risk surface:

- unbounded token spend
- accidental data disclosure
- prompt injection through repository text
- nondeterministic output treated as truth
- silent workflow drift
- provider coupling
- weak auditability
- unclear merge authority
- inappropriate use of write-capable automation

The actual engineering problem is:

> How can AI-assisted engineering workflows produce useful structured output while preserving deterministic safety, bounded cost, auditability, and human control?

This blueprint answers that question at architecture level.

---

## 3. Design Position

### 3.1 What AI is allowed to be

AI may act as:

- a reviewer
- a synthesizer
- a contradiction detector
- an ambiguity finder
- a threat-category sketcher
- a structured advisory instrument

### 3.2 What AI is not allowed to be

AI is not:

- a source of truth
- an autonomous merger
- a deployment authority
- a secrets-bearing execution surface
- a repository-wide reader by default
- a policy mutator
- a privileged system actor

### 3.3 Core architectural stance

The system is **guardrail-first**, **fail-closed**, and **authority-constrained**.

The model sits inside a layered deterministic envelope. The envelope, not the model, is the system.

---

## 4. Non-Negotiable Constraints

Before implementation, the following constraints are locked.

### 4.1 Bounded authority

AI output may be rendered, scored, cached, audited, and surfaced for review, but it may not directly merge code, deploy infrastructure, rotate secrets, or mutate policy without explicit human approval.

### 4.2 Diff-limited context

The system must operate on narrowed, task-relevant, allowlisted context. Whole-repo dumping is prohibited by design.

### 4.3 Redaction before provider access

Redaction and path filtering occur before any provider call is possible.

### 4.4 Strict schema at boundaries

Model output must be parsed into declared structure. If parsing fails, the system rejects the result.

### 4.5 Fail-closed behavior

Validation, policy, or budget failure must produce rejection rather than silent degradation.

### 4.6 Deterministic gates remain authoritative

Deterministic checks keep final authority. AI output is advisory even when structurally valid.

### 4.7 Provider abstraction

Core system logic may not be tightly coupled to a single model vendor.

### 4.8 Full run traceability

Meaningful executions must emit auditable artifacts sufficient for replay, diagnosis, and review.

---

## 5. System Goals

The DevKit is intended to provide the following outcomes.

1. Increase engineering leverage on review-heavy work.
2. Reduce ambiguity and contradiction in specs, diffs, and architectural material.
3. Bound the safety and cost risks of model usage.
4. Produce repeatable structured outputs.
5. Preserve explainability and post-run auditability.
6. Support both local and GitHub-mediated workflows.
7. Remain useful even when provider integrations are stubbed or offline.

---

## 6. Out of Scope

The following are explicitly out of scope for this version.

- autonomous code merge
- autonomous deployment
- autonomous policy modification
- secret retrieval from protected systems
- unrestricted repo ingestion
- write-capable agent swarms
- unsupervised multi-step tool execution against production systems
- treating schema-valid output as semantically correct by default

---

## 7. Operational Model

The DevKit is organized as a layered pipeline.

### 7.1 Layer 0 — Input boundary

Inputs enter as typed engineering artifacts:

- repository reference
- pull request reference
- diff summary
- changed files
- prompt template version
- task class
- runtime policy
- optional provider configuration

All inputs are assigned trust levels.

### 7.2 Layer 1 — Path policy and context eligibility

Files are filtered through allow/deny policy. Sensitive directories and structurally dangerous paths are excluded from model context.

### 7.3 Layer 2 — Redaction and sanitization

Eligible content is passed through redaction rules to suppress obvious secret and PII patterns and to reduce accidental disclosure.

### 7.4 Layer 3 — Prompt injection preflight

Repository text, diffs, and instructions are screened for prompt injection patterns. Safety mode accepts false positives over false negatives.

### 7.5 Layer 4 — Context minimization

Only the minimum useful diff and file content move forward. The system reduces low-signal input before any expensive operation.

### 7.6 Layer 5 — Budget and routing

The system decides whether the task deserves an AI call at all, and if so, what model class should receive it.

### 7.7 Layer 6 — Provider execution

Providers are treated as external execution surfaces. Their output is raw material, not authority.

### 7.8 Layer 7 — Parse and schema validation

Response text must parse to valid structured output. Invalid output is rejected.

### 7.9 Layer 8 — Decision boundary

A valid report is still classified as advisory. It may be rendered to markdown, attached to a PR, cached, audited, or flagged for manual review.

### 7.10 Layer 9 — Audit, metrics, replay

The run emits enough metadata to reconstruct what happened without trusting memory or provider logs alone.

---

## 8. High-Level Architecture

### 8.1 Principal subsystems

- **Policy subsystem**
  - allow paths
  - deny paths
  - strict schema enforcement
  - prompt injection guard enablement
  - budget limits
  - model selection defaults

- **Context control subsystem**
  - changed-file assembly
  - diff summary ingestion
  - size reduction
  - path gating
  - content shaping

- **Safety subsystem**
  - redaction
  - prompt injection heuristics
  - fail-closed validation

- **Provider abstraction subsystem**
  - provider interface
  - stub provider
  - future provider adapters

- **Schema boundary subsystem**
  - output contract
  - parse failure handling
  - structure validation

- **Audit subsystem**
  - request event
  - response event
  - error event
  - hashes and token usage

- **Cache subsystem**
  - deterministic keying
  - TTL-based storage
  - duplicate-spend prevention

- **Agent subsystem**
  - task-specific templates
  - structured report generation
  - agent versioning

- **Runner subsystem**
  - local runner
  - GitHub Actions runner
  - GitHub App / webhook architecture

---

## 9. Agent Model

Agents in this system are not autonomous personas. They are typed task modules with fixed contracts.

Each agent must define:

- an agent name
- an agent version
- a prompt template
- constraints
- an output schema
- a deterministic validation boundary
- a rendering target

Example task classes supported by the current architecture include:

- specification linting
- PR synthesis
- threat sketching

The architectural rule is that an agent is not defined by a clever prompt. It is defined by a prompt-plus-contract-plus-boundary package.

---

## 10. Trust Boundaries

This system has several hard trust boundaries.

### 10.1 Repository text is untrusted

Pull request content, spec text, comments, and changed files may contain adversarial instructions.

### 10.2 Model provider is external

Provider calls move data beyond the local boundary. Context must be reduced before crossing that line.

### 10.3 Model output is untrusted

Even well-formed output may be wrong, incomplete, or subtly misleading.

### 10.4 Human reviewers remain authoritative

Human approval is the boundary at which advisory output may influence actual engineering decisions.

---

## 11. Safety Architecture

### 11.1 Prompt injection resistance

The system uses conservative preflight heuristics to reject obvious attempts to override role, reveal secrets, or alter instructions.

### 11.2 Path isolation

The system denies unsafe path classes by default and only sends allowlisted engineering material.

### 11.3 Secret and PII redaction

Sensitive patterns are removed or masked before request assembly.

### 11.4 Schema-gated output

Only output that fits the declared report structure is accepted into downstream systems.

### 11.5 Read-only default integration

Integrations should default to read-only scope with comment-only feedback unless explicitly elevated.

### 11.6 Human-held merge authority

No report, score, or advisory comment is permitted to stand in for merge authority.

---

## 12. Budget and Cost Control Model

The DevKit treats cost as a first-class systems problem.

### 12.1 Budget primitives

For a run `r`:

- `calls(r)` = number of provider calls
- `Tin(r)` = total input tokens
- `Tout(r)` = total output tokens

The budget envelope is:

- `calls(r) <= C_max`
- `Tin(r) <= I_max`
- `Tout(r) <= O_max`

The run is rejected when any inequality is violated.

### 12.2 Cost equation

For provider pricing:

- `alpha` = cost per input token
- `beta` = cost per output token

Then expected run cost is:

`Cost(r) = alpha * Tin(r) + beta * Tout(r)`

System-level budget discipline requires that expected spend be bounded before scale is allowed.

### 12.3 Caching principle

Repeated calls on equivalent prompt and context should not re-spend budget.

A canonical cache key shape is:

`K = H(provider || model || prompt_version || prompt_hash || context_hash || policy_version)`

Where `H()` is a collision-resistant digest.

---

## 13. Auditability Model

Every meaningful run should emit structured audit events.

At minimum, the system records:

- request id
- provider
- model
- prompt hash
- context hash
- output hash
- timestamp
- token usage
- error state, if any

This allows operators to answer:

- what was asked
- what input class was sent
- what provider/model handled it
- whether the output was cached
- whether the output validated
- what it cost
- what failed if the run was rejected

Audit exists to support diagnosis, governance, and trust.

---

## 14. GitHub Integration Model

The DevKit supports two primary integration modes.

### 14.1 CI-driven mode

A GitHub Action runs on PR events, assembles eligible context, executes the advisory pipeline, and posts structured review comments.

### 14.2 App-driven mode

A webhook service verifies GitHub signatures, mints installation tokens, fetches changed files, runs the advisory pipeline, and posts PR comments or check runs.

The blueprint preference is:

- read-only by default
- no content mutation by default
- comment/check-run surfaces preferred over write surfaces
- deterministic verification before any pipeline execution

---

## 15. Human Roles

The system explicitly retains human authority in the following roles.

### 15.1 Architect

Defines the allowed shape of the system, agent classes, boundaries, and non-negotiables.

### 15.2 Security reviewer

Owns threat posture, path policy, redaction strategy, integration scope, and escalation policy.

### 15.3 Implementation engineer

Builds adapters, runners, validators, and renderers against the blueprint and spec.

### 15.4 Reviewer / operator

Interprets advisory output, checks evidence, and decides whether action is warranted.

### 15.5 Release authority

Retains final authority for merges, deployment, and policy change.

---

## 16. Acceptance Criteria

The blueprint is considered implemented correctly when the system can demonstrably do the following:

1. accept diff-limited engineering context
2. reject disallowed paths before provider access
3. redact obvious secrets and PII before request creation
4. detect and block obvious prompt injection patterns
5. assemble versioned prompt envelopes
6. enforce hard token/call budgets
7. cache equivalent requests deterministically
8. parse and schema-validate response structure
9. emit auditable request/response/error events
10. surface advisory reports without granting write authority
11. support both local and GitHub-oriented execution paths
12. fail closed on malformed output or policy violation

---

## 17. Failure Philosophy

The DevKit is intentionally conservative.

When uncertain, it should:

- reduce context
- reject unsafe paths
- block suspicious instructions
- refuse malformed output
- mark uncertainty explicitly
- escalate to human review

The preferred failure mode is lost convenience, not silent compromise.

---

## 18. Future Evolution

The architecture permits future additions, but only within the same control posture.

Possible later extensions include:

- stronger schema validators
- scored evidence confidence
- richer path-policy classes
- provider multiplexing
- offline replay tooling
- diff chunking for large PRs
- policy version pinning
- richer evaluation harnesses
- more agent classes

These are valid only if they preserve the current authority model: deterministic controls first, advisory AI second.

---

## 19. Blueprint Summary

The Thesis Chain AI DevKit is a control architecture for AI-assisted engineering, not an AI-first automation toy.

Its core principles are:

- AI remains untrusted
- deterministic boundaries remain authoritative
- context is minimized before exposure
- cost is bounded
- outputs are schema-gated
- audit is mandatory
- write authority is withheld by default
- humans retain final control

That is the system this blueprint defines.
