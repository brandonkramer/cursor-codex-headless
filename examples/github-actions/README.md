# GitHub Action: Codex PR review

Thin CI recipe using [`openai/codex-action@v1`](https://github.com/openai/codex-action) with the same hermetic review flags as this plugin:

| Flag | Why |
|------|-----|
| `--ephemeral` | No session rollout files |
| `--ignore-user-config` | No local `config.toml` MCP/plugins |
| `--ignore-rules` | No user/project execpolicy `.rules` |
| `--json` | Durable JSONL stream (action still returns `final-message`) |
| `output-schema-file: schemas/reviewer-verdict.schema.json` | Same structured verdict as MCP `structured: true` |

## Setup in your app repo

1. Copy `codex-pr-review.yml` → `.github/workflows/codex-pr-review.yml`
2. Copy `prompts/pr-review.md` → e.g. `.github/codex/prompts/pr-review.md` and update `prompt-file`
3. Vendor `schemas/reviewer-verdict.schema.json` from this plugin (or submodule/path)
4. Add repo secret `OPENAI_API_KEY`
5. Adjust `permission-profile` / comment job permissions as needed

Do **not** set `OPENAI_API_KEY` / `CODEX_API_KEY` as a job-wide `env` when untrusted code runs in the same job — pass the key only into `openai/codex-action`.

## Local parity

```bash
codex-headless review --structured --base origin/main -o review-verdict.json
# same hermetic flags + JSONL capture + usage on stderr
```
