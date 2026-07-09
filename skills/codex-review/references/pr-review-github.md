# GitHub PR review (markdown)

Posts a Codex review as a GitHub PR review via `gh`. Uses Conventional Comments, GFM alerts, tables, task lists, and collapsible findings.

## When

User asks to review a **GitHub PR** and post the result.

## Command

```bash
bash ~/.cursor/plugins/local/codex-headless/skills/codex-review/scripts/pr-review.sh <PR_NUMBER> [repo-root]
```

## Options

```bash
# Override model
CODEX_REVIEW_MODEL=gpt-5.6-sol \
  bash ~/.cursor/plugins/local/codex-headless/skills/codex-review/scripts/pr-review.sh 79 /path/to/repo

# Dry run (print body + event, do not post)
CODEX_PR_REVIEW_DRY_RUN=1 bash ~/.cursor/plugins/local/codex-headless/skills/codex-review/scripts/pr-review.sh 79

# Force neutral comment review (ignore verdict → approve/request-changes mapping)
CODEX_PR_REVIEW_ALWAYS_COMMENT=1 pr-review.sh 79

# Override GitHub review event
CODEX_PR_REVIEW_EVENT=comment pr-review.sh 79   # approve | comment | request-changes | auto
```

## GitHub review event mapping

| Codex `VERDICT:` line | `gh pr review` flag |
|-------------------------|---------------------|
| `approve` | `--approve` |
| `approve-with-nits` | `--approve` (nits in body as `nitpick (non-blocking):`) |
| `request-changes` | `--request-changes` |
| missing / unrecognized | `--comment` |

Set `CODEX_PR_REVIEW_ALWAYS_COMMENT=1` if the bot must never approve or block merge.

## Posted format

1. **Script header** — `> [!NOTE]` with :robot:, model, commit SHA link, PR link, timestamp
2. **Script verdict callout** — deterministic emoji + alert by `VERDICT:` (not left to the model)
3. **Codex body** — summary, severity table, strengths, collapsible findings, verification task list
4. **Script footer** — AI disclaimer + dry-run hint

Findings use [Conventional Comments](https://conventionalcomments.org/) labels (`issue (blocking):`, `suggestion (non-blocking):`, `praise:`, etc.).

## Emoji scheme (GitHub shortcodes)

Use **shortcodes** (`:robot:`) — GitHub renders them everywhere in PR markdown. The script owns verdict emojis; Codex owns section/findings emojis per prompt.

| Role | Shortcode | Where |
|------|-----------|--------|
| Bot / automated | `:robot:` | Script header |
| Approve | `:white_check_mark:` | Script verdict callout |
| Request changes | `:x:` | Script verdict callout |
| Review / comment only | `:speech_balloon:` | Script verdict callout (unknown verdict) |
| Summary | `:memo:` | `##` heading |
| Strengths | `:sparkles:` | `##` heading + praise lines |
| Findings (collapsed) | `:mag:` | `<summary>` title |
| Blocking | `:rotating_light:` | Table row + finding lines |
| Major | `:warning:` | Table row + finding lines |
| Suggestion | `:bulb:` | Table row + finding lines |
| Nitpick | `:nail_care:` | Table row + finding lines |
| Question | `:question:` | Optional findings subsection |
| Security | `:lock:` | Optional findings subsection |
| Verification | `:test_tube:` | `##` heading |
| None identified | `:white_check_mark:` | Checked task item |

**Avoid:** obscure Unicode (e.g. Armenian letters), emoji-only severity without text labels, or more than one emoji per finding line.

**Not in shortcodes:** inline `suggestion` apply buttons — Tier 2 only.

## Requirements

- `gh`, `codex`, and `jq` on `PATH`
- Uses `--profile review` (ultra, read-only) internally
- Reviews the **PR diff from GitHub**, not assumed local branch state

## After

Summarize verdict and GitHub event (`approve` / `comment` / `request-changes`) to the user after posting.
