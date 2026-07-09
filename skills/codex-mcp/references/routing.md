# Routing: built-in MCP vs headless

| Need | Use |
|------|-----|
| Ad-hoc multi-turn Codex | `codex` + `codex-reply` (this skill) |
| Multi-agent orchestration review/implement/probe | `codex_headless_*` — [codex-headless](../codex-headless/SKILL.md) |
| Profiles + `--ephemeral` + `--output-schema` | Shell `codex exec --profile … --ephemeral` |
| GitHub PR comment | [codex-review/pr-review-github.md](../codex-review/references/pr-review-github.md) |

## Prefer headless when

- One-shot worker or reviewer pass
- Need `--profile` or structured JSON schema
- Must not leave persistent MCP threads

## Prefer built-in MCP when

- Exploratory multi-turn conversation with Codex
- User wants to continue same thread with `codex-reply`
