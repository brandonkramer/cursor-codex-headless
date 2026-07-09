---
name: codex-computer-use
description: "Ask Codex CLI (--profile review, gpt-5.6-sol) to run local app verification that needs computer use, browser automation, simulators, screenshots, or runtime inspection."
tags: [tool, codex, computer-use, browser, gpt-5.6-sol, profiles]
triggers:
  - "codex computer use"
  - "gpt computer use"
  - "use codex to verify UI"
  - "browser verification with codex"
  - "have gpt check the app"
  - "screenshot verification"
  - "computer use"
  - "have codex test this flow"
  - "have gpt-5.6-sol test this flow"
  - "verify UI behavior with codex"
---

# Codex Computer Use

Runtime verification when observed behavior matters more than static code review.

## References

| Topic | File | When to read |
|-------|------|--------------|
| Surface pick | [surface-routing.md](references/surface-routing.md) | `@Browser` vs `@Chrome` vs `@Computer` |
| CLI verify | [headless-verify.md](references/headless-verify.md) | `codex exec` from orchestrator |
| Structured output | [structured-workflow.md](references/structured-workflow.md) | Orchestrated pass/fail schema |

## Quick decisions

**Which browser/desktop surface?** → [surface-routing.md](references/surface-routing.md)

**Headless verify from Cursor?** → [headless-verify.md](references/headless-verify.md)

**Structured pass/fail for workflow?** → [structured-workflow.md](references/structured-workflow.md)
