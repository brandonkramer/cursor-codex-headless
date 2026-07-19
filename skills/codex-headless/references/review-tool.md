# codex_headless_review

Read-only review via `--profile review --ephemeral --ignore-user-config --ignore-rules --json`
(skips global MCP/plugins and execpolicy `.rules`; durable JSONL + usage).

## Parameters

| Param | Effect |
|-------|--------|
| `review_uncommitted: true` | `codex exec review --uncommitted` |
| `review_base: "origin/main"` | `codex exec review --base …` |
| `prompt` | Custom scope (embed diff/context) |
| `structured: true` | `reviewer-verdict.schema.json` |
| `cwd` | Working directory override |
| `json` (default true) | JSONL; last `agent_message` fallback; `usage` |
| `jsonl_path` | Persist full JSONL stream |

## codex-reviewer agent

1. Run targeted tests via shell (separate gate from Codex agreement)
2. **`codex_headless_review`** when the MCP tool exists (required) — `{ review_uncommitted: true }` OR `prompt` + `structured: true`
3. Soft hang bound **~10 minutes** with no `[codex-headless]` progress → `verdict: "inconclusive"` (do not fail at 60–90s)
4. Prefer `structuredContent.usage` across `/codex-review-loop` iterations for cost tracking
5. Never Background-shell Codex; never use `~/.claude/plugins/cache/codex-headless-local/...`

Canonical plugin: `~/.cursor/plugins/local/codex-headless`.

Shell details: [codex-review/references/orchestrated-review.md](../codex-review/references/orchestrated-review.md).
