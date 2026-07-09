# Codex Implementation

Cursor agent skill for delegating clear implementation work to Codex while preserving local
review, diff control, and verification.

## Structure

```text
codex-implementation/
├── SKILL.md              # Index — routes to references/
├── README.md
├── CHANGELOG.md
├── references/           # Workflow docs (agent reads on demand)
├── docs/
│   ├── SSOT.md
│   └── sources.json
```

## Maintenance

1. `docs/SSOT.md` — source of truth
2. `references/*.md` — workflows derived from SSOT
3. `SKILL.md` — thin routing index only

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
