# billing.azure.ingest fixture notes (1.0)

- Valid request uses `subscriptionScope` plus read-only credential metadata (`credentialRef`, `authMode`).
- Invalid request covers unsupported `authMode` and malformed `subscriptionScope`.
- Expected response reflects deterministic Azure read-only baseline with pagination/incremental-sync provenance.
- Edge-case fixture `request.edge-case.multi-subscription.json` covers multi-subscription normalization.
