# billing.gcp.ingest fixture notes (1.0)

- Valid request uses `billingAccountScope` per GCP adapter contract.
- Invalid request sets `billingAccountScope` as string instead of array.
- Expected response mirrors Phase 1 stub output contract.
