# Resume and multi-step loops

When a follow-up turn may use `codex exec resume --last`.

## Start (no `--ephemeral`)

```bash
codex exec --profile engineer "Implement <spec>." < /dev/null
codex exec resume --last "Now add tests for what you just wrote."
```

## Rules

- Resume reuses original model, reasoning, sandbox — pick profile on first run
- Ephemeral runs cannot resume with prior context
- Not available via `codex_headless_*` MCP — use shell or built-in `codex` + `codex-reply`

## Token debugging (occasional)

```bash
codex exec --profile engineer --ephemeral --json "…" < /dev/null > /tmp/codex-events.jsonl
```
