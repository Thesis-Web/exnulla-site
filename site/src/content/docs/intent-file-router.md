# Intent File Router

## Overview

The Intent File Router demonstrates deterministic routing of payloads
based on a metadata header embedded in a file.

## Demo Walkthrough

Example header:

// TARGET: backend docs/notes.md

Router behavior:

1. Parse TARGET header
2. Determine repoKey
3. Apply routing policy
4. Compute SHA256
5. Route payload

## Routing Model

| Strategy        | Example                    | Result    |
| --------------- | -------------------------- | --------- |
| RepoKey mapping | backend docs/notes.md      | Landing A |
| RepoKey mapping | sims public/data/demo.json | Landing B |
| Path override   | backend landing-b/...      | Landing B |

## Use Cases

- CI artifact routing
- policy-driven file placement
- distributed build systems
- artifact integrity validation
