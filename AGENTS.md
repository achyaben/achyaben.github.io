# Repository Guidance

This is a production ordering system. Prefer small, reviewable changes and preserve existing behavior unless the user explicitly approves a broader change.

## Workflow

- For independent implementation work, use a separate worktree/branch when asked. Otherwise, working in the current tree is okay.
- Before changing code, inspect the relevant customer/admin/shared paths and confirm the intended behavior when requirements are ambiguous.
- Keep customer app, admin app, and `achyaben-db` changes separate unless the task clearly requires a coordinated app/database change.
- Do not commit before the user has manually tested when they ask for manual testing first.

## Validation

- For app changes, run the narrowest relevant build or check when dependencies are available: `yarn workspace customer build` for customer changes and `yarn workspace admin build` for admin changes.
- For shared app code, routing, Vite config, deployment, or cross-app changes, run the relevant app builds and add `yarn lint` only when lint-sensitive code changed.
- Do not run broad repo-wide checks just for ceremony when pre-commit already covers them.
- For database changes, inspect the schema/migrations first and call out storage/write tradeoffs for new indexes.
- If a check cannot be run, say why in the handoff.

## Production Caution

- Avoid loading broad nested data for customer-facing list/status screens when a lightweight summary query is enough.
- Treat localStorage as a performance cache, not the source of truth for mutable fields such as status, payment status, cancellation reason, or cancellation time.
- Prefer one scoped commit per optimization or issue so production smoke testing can happen incrementally.
