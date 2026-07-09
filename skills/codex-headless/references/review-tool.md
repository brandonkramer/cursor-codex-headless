# codex_headless_review

Read-only review via `--profile review --ephemeral`.

## Parameters

| Param | Effect |
|-------|--------|
| `review_uncommitted: true` | `codex exec review --uncommitted` |
| `review_base: "origin/main"` | `codex exec review --base …` |
| `prompt` | Custom scope (embed diff/context) |
| `structured: true` | `reviewer-verdict.schema.json` |
| `cwd` | Working directory override |

## codex-reviewer agent

1. Run targeted tests via shell
2. `codex_headless_review` with `review_uncommitted: true` OR `prompt` + `structured: true`

Shell details: [codex-review/references/orchestrated-review.md](../codex-review/references/orchestrated-review.md).
