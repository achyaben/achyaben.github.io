# Repository Guidance

This is a production ordering system. Prefer small, reviewable changes and preserve existing behavior unless the user explicitly approves a broader change.

## Workflow

- For new implementation tasks, use a separate worktree/branch when requested or when the current tree is dirty.
- Before changing code, inspect the relevant customer/admin/shared paths and confirm the intended behavior when requirements are ambiguous.
- Keep customer app, admin app, and `achyaben-db` changes separate unless the task clearly requires a coordinated app/database change.
- Do not commit before the user has manually tested when they ask for manual testing first.

## Validation

- For app changes, run the narrowest relevant build or check when dependencies are available.
- For database changes, inspect the schema/migrations first and call out storage/write tradeoffs for new indexes.
- If a check cannot be run, say why in the handoff.

## Production Caution

- Avoid loading broad nested data for customer-facing list/status screens when a lightweight summary query is enough.
- Treat localStorage as a performance cache, not the source of truth for mutable fields such as status, payment status, cancellation reason, or cancellation time.
- Prefer one scoped commit per optimization or issue so production smoke testing can happen incrementally.
