# Probe (explore before editing)

Cheap read-only scope survey.

## Command

```bash
codex exec --profile probe --ephemeral \
  -o "$REPORT" \
  "Survey <scope> and propose the smallest implementation plan. Do not edit files." < /dev/null
```

## MCP

`codex_headless_probe`.

## After

Rerun on `engineer` (or `implement` if scope is large) before shipping.
