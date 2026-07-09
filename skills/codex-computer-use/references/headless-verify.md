# Headless verify (CLI)

Evidence-based UI/browser verification via `codex exec` from the orchestrator.

## Command

```bash
codex exec --profile review --ephemeral \
  -o "$REPORT" \
  "Read AGENTS.md. Verify <app/page/flow>. Use computer/browser inspection if available. Do not edit files. Do not run dev servers, build commands, install commands, tests, or npx. Return observations, evidence, and pass/fail against the requested criteria." < /dev/null
```

## Prompt must include

- URL, path, or flow
- Viewport / account state if relevant
- Explicit pass/fail criteria

## Output

Separate **observed facts** from **inferred root cause**. Do not accept "looks fine" without evidence.

## MCP alternative

`codex_headless_review` with custom `prompt` (read-only profile).

## Traps

- Do not start dev servers unless user allowed
- Do not expose secrets in prompts or screenshots
- Verify claims before driving code changes
