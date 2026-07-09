# Multi-turn (`codex` + `codex-reply`)

Ad-hoc Codex sessions that persist across turns.

## Flow

1. Call **`codex`** with inline config — response includes `threadId`
2. Call **`codex-reply`** with `threadId` for follow-ups

## Rules

- Threads **persist** (no `--ephemeral`) — not for one-shot orchestration workers
- For structured one-shot orchestration, use [codex-headless](../codex-headless/SKILL.md) or shell `codex exec --profile … --ephemeral`

## Server

`codex mcp-server` (stdio). Wired in `~/.cursor/mcp.json` as `"codex": { "command": "codex", "args": ["mcp-server"] }`.
