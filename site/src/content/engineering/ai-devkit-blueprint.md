# Thesis Chain AI DevKit — Canonical Blueprint Markdown

## Source Note

This appendix mirrors the canonical AI DevKit design material as local site content so it can be displayed deterministically inside the ExNulla engineering page.

All rights reserved.

---

# Overview

This devkit provides a repeatable pattern for AI-assisted engineering workflows:

1. Build a **diff-limited context**
2. Apply **redaction** before any provider call
3. Use **versioned prompt templates**
4. Require **schema-validated outputs**
5. Enforce **budgets and caching**
6. Emit **auditable artifacts** and GitHub comments

The goal is to get AI leverage without creating an unbounded, non-deterministic system.

---

# Agent Architecture

Agents are small modules with:

- a name + version
- a prompt template (versioned)
- an output schema
- deterministic gates (schema validation + policy checks)

Agents emit a structured report format that can be:

- scored
- diffed
- cached
- audited
- rendered into human-friendly PR comments

AI output never bypasses validation boundaries.

---

# Safety Guardrails

Guardrails are enforced _before_ AI is called:

- **Prompt injection screening** (conservative heuristics)
- **Redaction rules** (remove obvious secrets/PII patterns)
- **Path allow/deny policy** (never send sensitive files)
- **Diff-limited context assembly** (no whole-repo dumps)
- **Strict schema validation** (fail closed)

Guardrails are part of the system design, not “best effort.”

---

# Budgeting & Caching

High-leverage pattern:

- run cheap deterministic checks first
- only call AI on meaningful diffs
- cache by hashing (prompt + context + template version)

Budgets include:

- max calls
- max total input tokens
- max total output tokens

Caching prevents repeated spend on identical inputs.

---

# GitHub Automation

Two common integration models:

## A) GitHub Actions (CI-driven)

- runs on PR events
- generates an advisory report
- posts a PR comment

## B) GitHub App (webhook-driven)

- verifies webhook signatures
- mints installation tokens
- fetches changed files
- posts PR comments/check runs

This repo demonstrates Actions, plus a GitHub App architecture in code form.
