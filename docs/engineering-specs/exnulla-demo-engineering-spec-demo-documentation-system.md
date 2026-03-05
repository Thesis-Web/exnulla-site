# ExNulla Demo Documentation System

Engineering Specification
Version: 1.0.0

## Objective

Implement a documentation system for interactive demos hosted in the ExNulla site.

Docs must be:

- statically served
- easily authored
- independent from demo builds
- deployable via the existing atomic pipeline

---

## File Structure

site/src/pages/docs/
site/src/content/docs/

Example

site/src/pages/docs/intent-file-router.astro

site/src/content/docs/intent-file-router.md

---

## Rendering Model

Docs pages render markdown content.

Astro page loads markdown file and renders layout.

Example page path

/docs/intent-file-router

---

## Build Integration

Docs pages are included in the Astro build process.

They are deployed with the rest of the site.

No additional CI pipeline steps are required.

Atomic deploy automatically publishes docs.

---

## Lab Page Integration

Lab tiles include two buttons:

Run Demo
Docs

Run Demo target:

/demos/<slug>/

Docs target:

/docs/<slug>/

---

## Markdown Content Format

Each markdown file should follow the standard structure.

### Overview

Describe the system concept.

### Why It Exists

Explain the problem being modeled.

### Demo Walkthrough

Explain how to use the demo.

### Architecture

Explain the system architecture.

### Core Mechanism

Describe the key engineering logic.

### Use Cases

Real-world applications.

### Design Tradeoffs

Explain engineering decisions.

### Future Extensions

Describe potential system evolution.

---

## Constraints

Docs must:

- build without runtime dependencies
- remain static content
- deploy through existing atomic release pipeline

---

## Non Goals

The documentation system will not:

- dynamically fetch demo data
- expose private specifications
- alter demo runtime behavior

---

## Verification

Successful implementation results in:

/docs/<slug> accessible
Docs button visible in Lab
Docs rendering markdown content
No change required to demo pipeline
