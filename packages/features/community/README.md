# Community Features

This folder is reserved for community-contributed modules.

## Layout

```text
packages/features/community/
  registry.json
  <module-id>/
    feature.json
    src/
    tests/
```

## Requirements

- Every module must declare owner + sponsor.
- AI/agent-assisted work must include provenance disclosure in PR.
- Community modules should default to optional/feature-flagged rollout.
- Contract + fixture + QA evidence gates apply the same as first-party modules.
