# Engineer one-shot (default)

Clear bounded spec, surgical edits. **Default profile.**

## When

- Known file list, API shape, or acceptance criteria
- Single file, few call sites, rename, extract helper, narrow test fix

## Command

From plugin root (after `bash scripts/install.sh`):

```bash
bin/codex-headless implement --profile engineer -p "Read AGENTS.md. Implement <spec>…"
# or -f task.md
```

Raw `codex exec` (equivalent):

```bash
codex exec --profile engineer --ephemeral \
  -o "$REPORT" \
  "Read AGENTS.md and CLAUDE.md. Implement <spec>. Keep changes surgical. Do not run tests, npx, install commands, or dev servers. Report changed files and verification you recommend." < /dev/null
```

## After

Inspect diff, remove unrelated churn, run targeted checks yourself.
