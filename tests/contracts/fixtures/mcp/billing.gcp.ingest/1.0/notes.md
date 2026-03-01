# billing.gcp.ingest fixture notes (1.0)

- Valid request uses `billingAccountScope` plus read-only credential metadata and `providerScope` envelope.
- Invalid request covers unsupported `authMode`, malformed `billingAccountScope`, and invalid `providerScope` type.
- Expected response reflects deterministic GCP read-only baseline with telemetry and recommender-ready provenance warnings.
- Edge-case fixture `request.edge-case.provider-scope.json` covers multi-account and provider-scope export metadata.
