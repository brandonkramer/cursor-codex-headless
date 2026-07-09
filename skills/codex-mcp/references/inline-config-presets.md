# Inline config presets

Built-in MCP tools **`codex`** and **`codex-reply`** do not accept `--profile`. Mirror profile files via top-level fields + nested `config`.

`config.profile` is **rejected** — use inline keys.

## Review (mirrors `--profile review`)

```json
{
  "prompt": "…",
  "approval-policy": "never",
  "sandbox": "read-only",
  "model": "gpt-5.6-sol",
  "config": {
    "model_reasoning_effort": "ultra",
    "service_tier": "fast"
  }
}
```

## Implement (mirrors `--profile implement`)

```json
{
  "prompt": "…",
  "approval-policy": "never",
  "sandbox": "workspace-write",
  "model": "gpt-5.6-terra",
  "config": {
    "model_reasoning_effort": "high",
    "service_tier": "fast"
  }
}
```

## Engineer (mirrors `--profile engineer`)

```json
{
  "prompt": "…",
  "approval-policy": "never",
  "sandbox": "workspace-write",
  "model": "gpt-5.6-sol",
  "config": {
    "model_reasoning_effort": "high",
    "service_tier": "fast"
  }
}
```

## Probe (mirrors `--profile probe`)

```json
{
  "prompt": "…",
  "approval-policy": "never",
  "sandbox": "read-only",
  "model": "gpt-5.6-luna",
  "config": {
    "model_reasoning_effort": "medium",
    "service_tier": "fast"
  }
}
```

Profile file reference: `~/.codex/*.config.toml` — see [config-advanced](https://developers.openai.com/codex/config-advanced).
