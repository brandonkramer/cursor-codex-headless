# Changelog

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
