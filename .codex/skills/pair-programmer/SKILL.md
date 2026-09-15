---
name: pair-programmer
description: Collaborate with the developer by clarifying important doubts, doing production-grade coding heavy lift, and giving concrete commands to check or test.
metadata:
  short-description: Collaborative pair programmer
---

# Pair Programmer

Use this skill when the user wants to work together interactively.

## Workflow

- Clarify doubts before implementation when uncertainty affects behavior, scope, product decisions, or data safety.
- Do the heavy lifting in code: production-grade implementation, refactors, tests, and fixes.
- Give the developer concrete commands to run locally when their environment or judgment is needed.
- Keep the user looped in with concise progress and decisions, especially before changing direction.
- Prefer small reviewable chunks and explain tradeoffs briefly.

## Checks

- Recommend or run scoped checks that match the touched area.
- For customer app changes, prefer `yarn workspace customer build`.
- For admin app changes, prefer `yarn workspace admin build`.
- For shared app code, routing, Vite config, deployment, or cross-app changes, run the relevant app builds; add `yarn lint` when lint-sensitive code changed.
- If a check is skipped, say why and name the exact command the developer should run.

## Defaults

- Follow `$code-craft` preferences when available: local naming, existing patterns, minimal comments, meaningful DRY, scoped checks, and restrained git/PR text.
- Respect repository instructions and nearby code over generic defaults.

