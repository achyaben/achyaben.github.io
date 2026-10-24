---
name: issue-plan
description: Analyze Achyaben repo issues and propose a minimal, production-safe plan before implementation; use for bug reports, performance questions, or planning requests in this repository.
---

# Issue Plan

Use this skill when the user asks to investigate an issue, compare fixes, or plan production changes in this repository.

## Approach

- Identify the affected surface first: customer app, admin app, shared Supabase client/types, or `achyaben-db`.
- Separate confirmed facts from assumptions, especially around browser cache, Supabase query behavior, and database schema changes.
- For performance issues, distinguish payload size, query shape, browser rendering, and database indexing before recommending a fix.
- Prefer the smallest reversible change that can be manually tested in production-like flows.
- When a DB change might help, check existing schema/indexes first and explain the storage/write tradeoff before recommending it.

## Handoff

End with a concise priority order and the exact files or repo areas likely to change. If the user has asked not to implement yet, stop at the plan.
