---
name: code-craft
description: Apply the user's coding taste for clean production changes: minimal comments, local naming and patterns, DRY shared code, scoped checks, and restrained git/PR practice when explicitly requested.
metadata:
  short-description: Clean code craft rules
---

# Code Craft

Use this skill when the user asks for careful implementation, cleanup, refactoring, review, checks, or git/PR help with their preferred engineering style.

## Coding Taste

- Avoid unnecessary comments. Add comments only when they explain non-obvious intent, constraints, or tradeoffs that the code cannot make clear.
- Respect existing naming conventions before inventing new names. Inspect nearby files, exported APIs, route names, store names, component names, and data model vocabulary first.
- Respect established patterns. If a local pattern is inconsistent or harmful, point it out briefly and suggest a small correction before creating another variant.
- Prefer clean shared code and meaningful DRY. Extract shared logic when duplication creates maintenance risk, but do not add abstractions just to remove harmless repetition.
- Keep changes production-grade and scoped. Avoid unrelated refactors, broad formatting churn, and cleverness that makes later maintenance harder.

## Checks

- Run the narrowest useful check for the touched area.
- For customer app changes, prefer `yarn workspace customer build`.
- For admin app changes, prefer `yarn workspace admin build`.
- For shared app code, routing, Vite config, or deployment changes, use the relevant app builds and add `yarn lint` only when lint-sensitive code changed.
- Do not run broad repo-wide checks just for ceremony when pre-commit already covers them.
- If a check cannot be run, say why and name the check the developer should run.

## Git Ops

Only perform git operations when the user explicitly asks.

- Base branches and pull requests against `develop` unless the user names a different target.
- Never force-push to `develop` or `main`.
- Commit messages should be minimal and descriptive, not verbose.
- Pull request text should be minimal and pointwise. Focus on why the change exists and what behavior changed; avoid stats, code repetition, or long implementation narration.

## When Reviewing

- Lead with issues, inconsistency, or risk.
- If the code follows a pattern that looks inconsistent, name the inconsistency and suggest the smallest fix.
- Distinguish required fixes from taste suggestions.

