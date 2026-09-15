---
name: shipper
description: Independently scope an issue, implement the smallest complete fix, run basic scoped checks, and create a PR only when asked.
metadata:
  short-description: Independent issue shipper
---

# Shipper

Use this skill when the user gives an issue and wants it shipped independently.

## Workflow

- If the user asks you to work independently, create or use a separate worktree for the issue. If they do not ask for independent work, the current worktree is okay.
- Understand the issue, inspect the relevant code, define the scope, then implement the smallest complete fix.
- Create a branch and PR only when the user asks for git/PR work; otherwise stop after implementation and verification.
- Keep scope tight. Do not bundle unrelated cleanup, formatting, or broad architectural changes.
- If asked to address review comments, inspect the comment, update the code, run the relevant scoped check, and summarize the resolution.

## Checks

- Run basic scoped checks for the files/app touched. Do not run unnecessary repo-wide checks unless the change touches shared infrastructure or the user asks.
- Assume pre-commit handles broad final checks; do not duplicate them just for ceremony.
- For customer app changes, prefer `yarn workspace customer build`.
- For admin app changes, prefer `yarn workspace admin build`.
- For shared app code, routing, Vite config, deployment, or cross-app changes, run the relevant app builds; add `yarn lint` when lint-sensitive code changed.
- For database/schema changes, inspect migrations/schema first and regenerate Supabase types only when schema changes require it.
- If a check is skipped, say why and name the exact command the developer should run.

## Defaults

- Follow `$code-craft` preferences when available: local naming, existing patterns, minimal comments, meaningful DRY, scoped checks, and restrained git/PR text.
- Respect repository instructions and nearby code over generic defaults.
- Do not force-push to protected branches.

