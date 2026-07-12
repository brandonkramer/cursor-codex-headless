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

1. Run targeted tests via shell (separate gate from Codex agreement)
2. `codex_headless_review` with `review_uncommitted: true` OR `prompt` + `structured: true`
3. On ~60–90s hang/timeout → `verdict: "inconclusive"` (prefer MCP; avoid open-ended shell waits)

Shell details: [codex-review/references/orchestrated-review.md](../codex-review/references/orchestrated-review.md).
