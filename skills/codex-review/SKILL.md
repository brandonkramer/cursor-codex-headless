---
name: codex-review
description: "Ask Codex CLI (gpt-5.6-sol, --profile review) for an independent code review of uncommitted changes, a branch diff, a commit, or a specific implementation. Headless review uses codex exec review or codex exec --profile review. Use when the user asks you to have Codex or GPT-5.6 review work, or when Codex should audit a diff, find bugs or regressions, or compare implementation against requirements."
tags: [tool, codex, review, gpt-5.6-sol, profiles, critique, pr-review]
triggers:
  - "codex review"
  - "gpt review"
  - "independent review"
  - "extra perspective"
  - "review with codex"
  - "have gpt review this"
  - "review this pr with codex"
  - "codex review pr"
  - "codex exec review"
  - "have gpt-5.6 review this"
---

# Codex Review

Independent read-only review via Codex. Prefer your own review for small local checks. Do not delegate just to avoid reading code.

## References

| Topic | File | When to read |
|-------|------|--------------|
| Profiles and rules | [profiles-and-rules.md](references/profiles-and-rules.md) | First run, or ephemeral/resume/`< /dev/null` questions |
| GitHub PR | [pr-review-github.md](references/pr-review-github.md) | Review a PR and post to GitHub |
| Local diff (built-in) | [builtin-diff-review.md](references/builtin-diff-review.md) | `--uncommitted`, `--base`, or `--commit` |
| Custom scope | [custom-scope-review.md](references/custom-scope-review.md) | Architecture, embedded diff, plan review |
| codex-reviewer agent | [orchestrated-review.md](references/orchestrated-review.md) | Structured JSON after worker subagents |

## Quick decisions

**GitHub PR comment?** → [pr-review-github.md](references/pr-review-github.md) (background shell + `CODEX_PR_REVIEW_DONE` sentinel — no fixed timeout)

**Quick local diff, no custom prompt?** → [builtin-diff-review.md](references/builtin-diff-review.md)

**Custom scope (architecture, plan, embedded diff)?** → [custom-scope-review.md](references/custom-scope-review.md)

**codex-reviewer final pass?** → [orchestrated-review.md](references/orchestrated-review.md)

**Profile / ephemeral / stdin rules?** → [profiles-and-rules.md](references/profiles-and-rules.md)
