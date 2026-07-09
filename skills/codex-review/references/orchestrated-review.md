# Orchestrated review (codex-reviewer agent)

Final verification pass after worker subagents in a multi-agent orchestration workflow. Emit structured JSON the parent can parse.

Invoked via Task with `subagent_type: "codex-reviewer"` (plugin agent in `agents/codex-reviewer.md`).

## Order

1. Run targeted tests via shell; record command, pass/fail, snippets
2. Codex review (this workflow)
3. Spot-check findings; set `accepted` on each in structured output

## MCP (preferred)

```json
{ "review_uncommitted": true }
```

or

```json
{ "prompt": "…", "structured": true }
```

Tool: `codex_headless_review` — see [codex-headless/references/review-tool.md](../codex-headless/references/review-tool.md).

## Shell fallback

```bash
REPORT="$(mktemp)"
bin/codex-headless review --structured -f "$PROMPT" -o "$REPORT"
```

Raw `codex exec` (equivalent):

```bash
codex exec --profile review --ephemeral \
  --output-schema ~/.codex/schemas/reviewer-verdict.schema.json \
  -o "$REPORT" - < "$PROMPT" < /dev/null
```

Populate `tests` from shell commands you ran before Codex review.

## Output format

- Orchestration: `reviewer-verdict.schema.json` (JSON)
- GitHub PR comments: markdown via [pr-review-github.md](pr-review-github.md) — not the schema
