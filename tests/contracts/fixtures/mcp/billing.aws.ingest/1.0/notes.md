# billing.aws.ingest fixture notes (1.0)

- Valid request uses `accountScope` per AWS adapter contract.
- Invalid request sets `accountScope` as string instead of array.
- Expected response mirrors Phase 1 stub output contract.
