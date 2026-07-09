# Built-in diff review (no custom prompt)

Use when a quick local diff review needs no custom instructions.

## Commands

```bash
# Preferred shell fallback (plugin root):
bin/codex-headless review --uncommitted
bin/codex-headless review --base origin/main -o review.md

# Or:
bash scripts/review-local.sh --uncommitted
```

## MCP equivalent

| Shell | MCP (`codex_headless_review`) |
|-------|-------------------------------|
| `review --uncommitted` | `{ "review_uncommitted": true }` |
| `review --base origin/main` | `{ "review_base": "origin/main" }` |
| custom scope | `{ "prompt": "…" }` — see [custom-scope-review.md](custom-scope-review.md) |

## Do not combine

`review --base` and a custom stdin prompt are **mutually exclusive**.
