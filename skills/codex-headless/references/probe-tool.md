# codex_headless_probe

Cheap exploratory pass via `--profile probe --ephemeral` (Luna, read-only).

## Parameters

| Param | Effect |
|-------|--------|
| `prompt` (required) | Exploratory task |
| `cwd` | Working directory override |

## Pattern

Probe → escalate to `codex_headless_implement` or `codex_headless_review`.

Shell details: [codex-implementation/references/probe.md](../codex-implementation/references/probe.md).
