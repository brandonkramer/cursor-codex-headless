#!/usr/bin/env python3
"""Shared pseudo-TTY runner for agent CLI delegation (stream by default)."""
from __future__ import annotations

from collections.abc import Callable
import os
import pty
import re
import select
import sys
import time

ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")
OSC_RE = re.compile(r"\x1b\].*?\x07")
CSI_TAIL_RE = re.compile(r"\x1b\[[^\x07\x1b]*$")
OSC_TAIL_RE = re.compile(r"\x1b\][^\x07]*$")


def strip_ansi(text: str, *, trim: bool = True) -> str:
    text = OSC_RE.sub("", text)
    text = ANSI_RE.sub("", text)
    return text.strip() if trim else text


def split_incomplete_escape(text: str) -> tuple[str, str]:
    """Hold back a trailing partial ANSI/OSC sequence across chunk boundaries."""
    if OSC_TAIL_RE.search(text):
        idx = text.rfind("\x1b]")
        return text[:idx], text[idx:]
    if CSI_TAIL_RE.search(text):
        idx = text.rfind("\x1b[")
        return text[:idx], text[idx:]
    if text.endswith("\x1b"):
        return text[:-1], "\x1b"
    return text, ""


class StreamStripper:
    def __init__(self) -> None:
        self._carry = ""

    def feed(self, data: bytes) -> str:
        text = self._carry + data.decode("utf-8", errors="replace")
        safe, self._carry = split_incomplete_escape(text)
        return strip_ansi(safe, trim=False)

    def flush(self) -> str:
        tail = strip_ansi(self._carry, trim=False)
        self._carry = ""
        return tail


def _read_available(fd: int) -> bytes:
    try:
        return os.read(fd, 65536)
    except OSError:
        return b""


def _drain_pty(
    master: int,
    pid: int,
    deadline: float,
    *,
    on_chunk: Callable[[bytes], None] | None = None,
) -> tuple[list[bytes], int | None]:
    chunks: list[bytes] = []
    child_status: int | None = None

    def handle(data: bytes) -> None:
        if not data:
            return
        chunks.append(data)
        if on_chunk is not None:
            on_chunk(data)

    while time.time() < deadline:
        ready, _, _ = select.select([master], [], [], 0.5)
        if master in ready:
            data = _read_available(master)
            if not data:
                break
            handle(data)
            continue

        exited_pid, status = os.waitpid(pid, os.WNOHANG)
        if exited_pid != 0:
            child_status = status
            while True:
                ready, _, _ = select.select([master], [], [], 0.1)
                if master not in ready:
                    break
                data = _read_available(master)
                if not data:
                    break
                handle(data)
            break

    return chunks, child_status


def run_cmd_pty(
    cmd: list[str],
    *,
    stdin_text: str | None = None,
    max_secs: int,
    stream: bool = True,
) -> tuple[int, str]:
    """Run *cmd* under a PTY; optionally feed *stdin_text* via a pipe."""
    if not cmd:
        raise ValueError("cmd required")

    master, slave = pty.openpty()
    stdin_read_fd: int | None = None
    stdin_write_fd: int | None = None
    if stdin_text is not None:
        stdin_read_fd, stdin_write_fd = os.pipe()

    pid = os.fork()
    if pid == 0:
        os.setsid()
        os.close(master)
        if stdin_read_fd is not None:
            os.close(stdin_write_fd)
            os.dup2(stdin_read_fd, 0)
            os.close(stdin_read_fd)
        else:
            os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)
        if slave > 2:
            os.close(slave)
        os.execvp(cmd[0], cmd)

    os.close(slave)
    if stdin_read_fd is not None:
        os.close(stdin_read_fd)
        if stdin_text:
            os.write(stdin_write_fd, stdin_text.encode())
        os.close(stdin_write_fd)

    deadline = time.time() + max_secs
    stripper = StreamStripper()

    def emit_chunk(data: bytes) -> None:
        if not stream:
            return
        text = stripper.feed(data)
        if text:
            sys.stdout.write(text)
            sys.stdout.flush()

    chunks, child_status = _drain_pty(master, pid, deadline, on_chunk=emit_chunk)

    if child_status is None:
        exited_pid, child_status = os.waitpid(pid, os.WNOHANG)
        if exited_pid == 0:
            if time.time() >= deadline:
                os.kill(pid, 15)
                time.sleep(0.3)
                try:
                    os.kill(pid, 9)
                except ProcessLookupError:
                    pass
                os.waitpid(pid, 0)
                return 124, ""
            _, child_status = os.waitpid(pid, 0)

    exit_code = (
        os.waitstatus_to_exitcode(child_status)
        if hasattr(os, "waitstatus_to_exitcode")
        else child_status >> 8
    )

    if stream:
        tail = stripper.flush()
        if tail:
            sys.stdout.write(tail)
            sys.stdout.flush()
        return exit_code, ""

    text = strip_ansi(b"".join(chunks).decode("utf-8", errors="replace"))
    return exit_code, text


def stream_env_default(env_name: str, *, default_on: bool = True) -> bool:
    raw = os.environ.get(env_name)
    if raw is None:
        return default_on
    return raw != "0"
