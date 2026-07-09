# Codex Computer Use

Cursor agent skill for delegating browser, UI, screenshot, and computer-use verification to Codex
while keeping the caller responsible for interpreting the evidence.

## Structure

```text
codex-computer-use/
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
