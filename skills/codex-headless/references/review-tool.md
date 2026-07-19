# codex_headless_review

Read-only review via `--profile review --ephemeral --ignore-user-config`
(skips global MCP/plugins from `config.toml`).

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
2. **`codex_headless_review`** when the MCP tool exists (required) — `{ review_uncommitted: true }` OR `prompt` + `structured: true`
3. Soft hang bound **~10 minutes** with no progress → `verdict: "inconclusive"` (do not fail at 60–90s)
4. Never Background-shell Codex; never use `~/.claude/plugins/cache/codex-headless-local/...`

Canonical plugin: `~/.cursor/plugins/local/codex-headless`.

Shell details: [codex-review/references/orchestrated-review.md](../codex-review/references/orchestrated-review.md).
