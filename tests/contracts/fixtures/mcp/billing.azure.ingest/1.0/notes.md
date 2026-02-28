# billing.azure.ingest fixture notes (1.0)

- Valid request uses `subscriptionScope` per Azure adapter contract.
- Invalid request sets `subscriptionScope` as string instead of array.
- Expected response mirrors Phase 1 stub output contract.
