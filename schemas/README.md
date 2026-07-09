# Codex JSON schemas (reference)

Structured output schemas for orchestration. Codex loads these via `--output-schema`.

Install to `~/.codex/schemas/`:

```bash
bash scripts/install.sh
# or: cp schemas/*.schema.json ~/.codex/schemas/
```

| File | Used by |
|------|---------|
| `reviewer-verdict.schema.json` | codex-reviewer agent, `codex-headless review --structured` |
| `implement-report.schema.json` | Parallel workers, `codex-headless implement --structured` |
