#!/usr/bin/env python3
"""Run codex exec under a pseudo-TTY; stream stdout by default."""
from __future__ import annotations

import os
import sys

from delegation_pty import run_cmd_pty, stream_env_default


def _parse_argv(argv: list[str]) -> tuple[str, str | None, int, bool, list[str]]:
    prompt = ""
    prompt_file: str | None = None
    max_secs = int(os.environ.get("CODEX_MAX_SECS", "600"))
    stream = stream_env_default("CODEX_STREAM")
    codex_argv: list[str] = []
    i = 0

    while i < len(argv):
        arg = argv[i]
        if arg in ("-f", "--file"):
            prompt_file = argv[i + 1]
            i += 2
            continue
        if arg == "--max-secs":
            max_secs = int(argv[i + 1])
            i += 2
            continue
        if arg == "--stream":
            stream = True
            i += 1
            continue
        if arg == "--no-stream":
            stream = False
            i += 1
            continue
        if arg in ("-h", "--help"):
            print(
                "usage: codex-pty.py [-f prompt.txt] [--max-secs N] [--no-stream] "
                "[codex exec flags…] -\n"
                "       codex-pty.py -f prompt.txt --profile review --ephemeral "
                "-m gpt-5.6-sol -o out.txt -",
                file=sys.stderr,
            )
            sys.exit(0)
        if (
            not arg.startswith("-")
            and not prompt
            and prompt_file is None
            and not codex_argv
        ):
            prompt = arg
            i += 1
            continue
        codex_argv = argv[i:]
        break

    return prompt, prompt_file, max_secs, stream, codex_argv


def main() -> int:
    prompt, prompt_file, max_secs, stream, codex_argv = _parse_argv(sys.argv[1:])

    if not codex_argv:
        print("error: codex exec arguments required", file=sys.stderr)
        return 2

    if codex_argv[0] != "exec":
        codex_argv = ["exec", *codex_argv]

    if prompt_file:
        with open(prompt_file, encoding="utf-8") as fh:
            prompt = fh.read()
    elif not prompt and not sys.stdin.isatty():
        prompt = sys.stdin.read()

    cmd = ["codex", *codex_argv]
    stdin_text: str | None = None

    if prompt.strip():
        if cmd[-1] == "-":
            stdin_text = prompt
        else:
            cmd.append(prompt)

    code, text = run_cmd_pty(
        cmd,
        stdin_text=stdin_text,
        max_secs=max_secs,
        stream=stream,
    )

    if stream:
        return 0 if code == 0 else code

    if text:
        print(text)
        return 0 if code == 0 else code

    print(
        "error: codex returned empty output (PTY wait "
        f"{max_secs}s, exit {code}).",
        file=sys.stderr,
    )
    return 1 if code == 0 else code


if __name__ == "__main__":
    sys.exit(main())
