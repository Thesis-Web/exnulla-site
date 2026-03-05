# ExNulla Demo Documentation System

Version: 1.0.0

## Purpose

Provide a documentation surface for ExNulla interactive demos that explains:

- the system being demonstrated
- the architectural reasoning
- the use cases
- how to interact with the demo

The documentation system must maintain a clean separation between:

1. **Interactive artifacts** (demo applications)
2. **Architectural explanation** (docs pages)

---

## Core Design

Each demo exposes two user actions:

Run Demo
Docs

Run Demo loads the artifact.

Docs opens a dedicated documentation page.

---

## URL Structure

Lab Index
/lab

Interactive Demo
/demos/<slug>/

Documentation Page
/docs/<slug>/

Example

/lab
/demos/intent-file-router/
/docs/intent-file-router/

---

## Content Ownership

Demo artifacts live in:

exnulla-demos repo

Docs live in:

exnulla-site repo

This prevents documentation updates from requiring demo rebuilds.

---

## Documentation Content Model

Each documentation page includes:

Overview
Why It Exists
Demo Walkthrough
Architecture
Core Mechanism
Use Cases
Design Tradeoffs
Future Extensions

---

## Security / IP Model

Documentation pages may include:

- full public architecture
- redacted specs
- conceptual explanations

Full proprietary blueprints are not required to be published.

---

## UX Goals

The system should communicate:

- systems thinking
- architecture clarity
- engineering discipline

without overwhelming the Lab interface.

---

## Success Criteria

A hiring manager or engineer should be able to:

1. Run the demo
2. Open documentation
3. Understand the architectural value within 2 minutes
