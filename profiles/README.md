# Codex profiles (reference)

Reference copies of the headless `codex exec --profile` configs. Codex loads profiles from `~/.codex/<name>.config.toml`, not from this folder.

## Install

```bash
cp profiles/*.config.toml ~/.codex/
cp ../schemas/*.schema.json ~/.codex/schemas/
# or from plugin root:
bash scripts/install.sh
```

| Profile | Model | Reasoning | Sandbox |
|---------|-------|-----------|---------|
| `review` | gpt-5.6-sol | ultra | read-only |
| `engineer` | gpt-5.6-sol | high | workspace-write |
| `implement` | gpt-5.6-terra | high | workspace-write |
| `probe` | gpt-5.6-luna | medium | read-only |
