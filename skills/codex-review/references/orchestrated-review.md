# Orchestrated review (codex-reviewer agent)

Final verification pass after worker subagents in a multi-agent orchestration workflow. Emit structured JSON the parent can parse.

Invoked via Task with `subagent_type: "codex-reviewer"` (plugin agent in `agents/codex-reviewer.md`).

If Task does **not** expose `codex-reviewer`, the **parent** must call MCP `codex_headless_review` (`structured: true`) directly — **never** fake the reviewer as `generalPurpose` / `/worker`.

## Order

1. Run targeted tests via shell; record command, pass/fail, snippets
2. Codex review (this workflow)
3. Spot-check findings; set `accepted` on each in structured output

Keep **tests** and **Codex** separate in the report: tests-green ≠ Codex-approved.

## MCP (preferred)

```json
{ "review_uncommitted": true }
```

or

```json
{ "prompt": "…", "structured": true }
```

Tool: `codex_headless_review` — see [codex-headless/references/review-tool.md](../codex-headless/references/review-tool.md).

Prefer MCP over open-ended shell. Bound the wait (~60–90s); on timeout/hang emit `verdict: "inconclusive"` and return.

## Parent wait rules (orchestrator)

- Rely on Task/subagent **completion notifications** — do not poll with `AwaitShell` sleep loops.
- Never `resume` a still-running reviewer agent; wait for completion or abort, then integrate.
- On review timeout, fold `inconclusive` into the user summary and finish — do not block forever.

## Shell fallback

```bash
REPORT="$(mktemp)"
bin/codex-headless review --structured -f "$PROMPT" -o "$REPORT"
```

Raw `codex exec` (equivalent):

```bash
codex exec --profile review --ephemeral --ignore-user-config \
  --output-schema ~/.codex/schemas/reviewer-verdict.schema.json \
  -o "$REPORT" - < "$PROMPT" < /dev/null
```

Populate `tests` from shell commands you ran before Codex review.

## Output format

- Orchestration: `reviewer-verdict.schema.json` (JSON)
- Verdict enum: `pass` | `pass-with-notes` | `fail` | `inconclusive`
- GitHub PR comments: markdown via [pr-review-github.md](pr-review-github.md) — not the schema
