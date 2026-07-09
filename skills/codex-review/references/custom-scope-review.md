# Custom-scope review (prompt file)

Use for architecture review, embedded diffs, plans, or requirement checks beyond built-in `codex exec review`.

## Command

```bash
codex exec --profile review --ephemeral \
  -o "$REPORT" \
  - < "$PROMPT" < /dev/null
```

Embed the diff or scope in `$PROMPT`. Do not use `codex exec review --base` with a custom prompt.

## Prompt template

```text
Review these changes for bugs, regressions, missing tests, security issues, and requirement
mismatches.

Prioritize findings over severity. For each finding include:
- severity
- file and line reference
- concrete failure mode
- suggested fix direction

Do not edit files. If there are no substantive findings, say so and name any residual test gaps.
```

Include project rules from `AGENTS.md` when relevant.

## Token debugging (occasional)

```bash
codex exec --profile review --ephemeral --json "…" < /dev/null > /tmp/codex-events.jsonl
```
