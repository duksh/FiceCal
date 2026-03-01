# Fixture Notes: modules.optional-fallback@1.0

- `input.fail.optional-timeout.json` -> `output.expected.degraded.json` validates optional-module timeout fallback behavior.
- `input.retest.optional-ok.json` -> `output.expected.healthy.json` validates retest path once optional module recovers.
- Core fields remain present in both outputs, proving optional module failures do not break the core response envelope.
