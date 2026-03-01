# billing.openops.ingest fixture notes (1.0)

- Valid request includes read-only credential metadata (`credentialRef`, `authMode`) and workspace scope.
- Invalid request captures unsupported `authMode` and malformed `workspaceScope`.
- Expected response reflects deterministic non-zero real ingest baseline for contract validation.
- Edge-case fixture `request.edge-case.multi-workspace.json` covers multi-workspace and non-USD input handling.
