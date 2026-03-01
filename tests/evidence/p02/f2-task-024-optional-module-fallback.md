# F2-TASK-024 QA Evidence: Optional-Module Fallback

## Scope

Validate that optional module failures do not break the core user experience and that fallback metadata remains deterministic.

## Failing-path evidence (fallback applied)

- Fixture input: `tests/contracts/fixtures/modules.optional-fallback/1.0/input.fail.optional-timeout.json`
- Expected degraded output: `tests/contracts/fixtures/modules.optional-fallback/1.0/output.expected.degraded.json`
- Expected guarantees:
  - `status` is `degraded`
  - `fallbackApplied` is `true`
  - `failedModuleIds` includes the failed optional module
  - `reasonCodes` includes normalized category (`timeout_or_rate_limit`)
  - core summary remains present and valid

## Retest evidence (module recovered)

- Fixture input: `tests/contracts/fixtures/modules.optional-fallback/1.0/input.retest.optional-ok.json`
- Expected healthy output: `tests/contracts/fixtures/modules.optional-fallback/1.0/output.expected.healthy.json`
- Expected guarantees:
  - `status` returns to `ok`
  - `fallbackApplied` is `false`
  - `failedModuleIds` is empty
  - optional enrichment is restored without changing core envelope shape

## Notes

- Fixture-level evidence is tracked with: `tests/contracts/fixtures/modules.optional-fallback/1.0/notes.md`
- This evidence package is the traceability anchor for `F2-TASK-024` closure.
