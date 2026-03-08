# Thesis Chain AI DevKit — Canonical Engineering Spec Markdown

## Source Note

This appendix mirrors the canonical AI DevKit operational and risk-control material as local site content so it can be displayed deterministically inside the ExNulla engineering page.

All rights reserved.

---

# Evaluation & Metrics

Do not measure “tokens used.” Measure value.

Suggested metrics:

- reduction in review time
- defect prevention (before merge)
- number of contradictions caught
- clarity improvements (missing definitions, broken references)
- false positive rate

AI should be evaluated like any other tool: by outcomes and cost.

---

# Threat Model for Engineering Agents

This document describes threat categories relevant to AI-assisted engineering agents.
It is intentionally practical, conservative, and centered on preventing unsafe automation.

---

## Assets to Protect

- secrets (API keys, tokens, credentials)
- private source code and proprietary logic
- production configuration and infrastructure details
- personal data (PII) and regulated information
- repository integrity (no unauthorized changes)

---

## Trust Boundaries

- PR authors are untrusted (including internal contributors)
- PR diffs may contain adversarial text
- AI providers are external systems
- AI output is non-deterministic and must be treated as untrusted input

---

## Primary Threats

### 1) Prompt Injection

**Goal:** coerce the agent into ignoring rules or leaking sensitive content.

**Mitigations:**

- conservative injection heuristics (fail closed)
- strict context allowlist (paths and size)
- redaction pipeline
- separate system/task/constraints sections
- schema-gated output only

### 2) Data Exfiltration via Context

**Goal:** force the system to send secrets/PII to a provider.

**Mitigations:**

- denylist paths (`.github/`, configs, secrets)
- diff-limited context only
- redaction rules
- hard caps on file size and file count

### 3) Tool Abuse (Write Access)

**Goal:** agent modifies code, merges PRs, or changes repo state.

**Mitigations:**

- default read-only tokens
- disable write permissions unless explicitly required
- human-in-the-loop for merges
- separate “comment” permissions from “content” permissions

### 4) Non-Deterministic Output Used as Authority

**Goal:** AI output becomes a merge gate or source of truth.

**Mitigations:**

- deterministic checks remain authoritative
- AI output remains advisory
- schema validation does not imply correctness, only structure
- explicit “uncertainty” handling

### 5) Supply Chain / Dependency Drift

**Goal:** CI runs unknown tools or dependencies.

**Mitigations:**

- minimal dependencies in CI
- pin actions versions
- avoid installing arbitrary packages for “AI steps”

---

## Safe Default Operating Mode

- AI runs only on allowlisted paths
- AI output is advisory comments only
- CI uses stub provider in public skeletons
- production integration requires explicit review and audit

---

## Summary

Agent systems fail when treated as magic.  
This devkit treats them as untrusted tools with strict boundaries.
