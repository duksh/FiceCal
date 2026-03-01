# billing.openops.ingest fixture notes (1.0)

- Valid request uses `workspaceScope` plus read-only credential metadata (`credentialRef`, `authMode`).
- Invalid request uses wrong type for `workspaceScope`.
- Expected response reflects deterministic read-only mapped output (`openops-readonly-v1.0.0`).
