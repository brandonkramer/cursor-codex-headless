# Changelog

## [1.3.5] - 2026-07-19

### Changed
- Orchestrated review: MCP `codex_headless_review` **required** when available; ban Background shell for Codex.
- Soft hang bound raised to ~10 minutes (no longer treat 60–90s as failure).
- Canonical install path: `~/.cursor/plugins/local/codex-headless` only (never Claude plugin cache).
- MCP launch hardened: `node --import tsx` + expanded PATH (nvm/Homebrew/Volta) in `mcp.json` / `bin/run-ts`.

## [1.3.4] - 2026-07-17

### Changed
- Headless review always passes `--ignore-user-config` so global MCP/plugins are not loaded
  (`mcp_servers={}` does not clear; profile + auth still apply).

## [1.3.3] - 2026-07-12

### Changed
- Orchestrated review: prefer MCP, bound ~60–90s waits, emit `inconclusive` on hang/timeout.
- Document parent anti-hang rules (no AwaitShell polling, no resume-while-running, never fake `codex-reviewer` as `generalPurpose`).
- `reviewer-verdict.schema.json` adds `inconclusive` verdict.

## [1.3.2] - 2026-07-10

### Added
- `pr-review.sh` prints `CODEX_PR_REVIEW_DONE` on stderr at exit for agent completion detection.
- Documented Cursor background + Await / `notify_on_output` invocation in `pr-review-github.md`.

## [1.3.1] - 2026-07-10

### Changed
- `pr-review.sh` runs Codex via `codex-pty.py` — live stdout streaming by default (`CODEX_STREAM=0` to buffer).
- Added `codex-pty.py` and `delegation_pty.py` alongside `pr-review.sh`.

## [1.3.0] - 2026-07-10

### Changed
- `pr-review.sh` posts GitHub-native markdown: Conventional Comments, alerts, severity table, collapsible findings, task lists.
- Maps `VERDICT:` line to `gh pr review --approve`, `--request-changes`, or `--comment`.
- Adds commit/PR metadata header and AI disclaimer footer.
- New env: `CODEX_PR_REVIEW_EVENT`, `CODEX_PR_REVIEW_ALWAYS_COMMENT`.

## [1.2.0] - 2026-07-10

### Changed
- Headless review uses `--profile review --ephemeral` and `codex exec review` only.
- Explicit reasoning via profiles: review=ultra, implement=high, probe=medium.
- Orchestration reviews use `reviewer-verdict.schema.json`; PR reviews stay markdown.
- `pr-review.sh` uses `--profile review --ephemeral`.

## [1.1.0] - 2026-07-10

### Changed
- Default review model updated from `gpt-5.5` to `gpt-5.6-sol` (GPT-5.6 GA).
- `pr-review.sh` default model is now `gpt-5.6-sol`; `gpt-5.5` remains an override/fallback.

## [1.0.0] - 2026-07-06

### Added
- Created focused Codex review skill for read-only critique, PR review routing, and independent review prompts.
- Added owned PR review helper script, quality evals, and review playbook.
