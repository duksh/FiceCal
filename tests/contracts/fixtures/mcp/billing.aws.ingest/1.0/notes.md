# billing.aws.ingest fixture notes (1.0)

- Valid request uses `accountScope` plus read-only credential metadata (`credentialRef`, `authMode`).
- Invalid request covers unsupported `authMode` and malformed `accountScope`.
- Expected response reflects deterministic AWS read-only baseline with retry-policy provenance.
- Edge-case fixture `request.edge-case.multi-account.json` covers multi-account ingest normalization.
