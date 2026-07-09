# Codex Review

Cursor agent skill for delegating read-only review work to Codex while keeping the caller
responsible for verification and final judgment.

## Structure

```text
codex-review/
├── SKILL.md              # Index — routes to references/
├── README.md
├── CHANGELOG.md
├── references/           # Workflow docs (agent reads on demand)
├── docs/
│   ├── SSOT.md
│   └── sources.json
├── scripts/
│   └── pr-review.sh
```

## Maintenance

1. `docs/SSOT.md` — source of truth
2. `references/*.md` — workflows derived from SSOT
3. `SKILL.md` — thin routing index only

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
