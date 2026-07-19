import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  consumeJsonlLine,
  formatUsageLine,
  type CodexUsage,
  type JsonlProgressEvent,
} from "./jsonl.ts";

export type HeadlessProfile = "review" | "implement" | "engineer" | "probe";

export type ImplementProfile = "implement" | "engineer";

export type ContentSource = "output-file" | "jsonl-agent-message" | "empty";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_HEARTBEAT_MS = 15_000;

function resolveSchema(kind: "review" | "implement"): string {
  const name =
    kind === "review" ? "reviewer-verdict.schema.json" : "implement-report.schema.json";
  const userPath = join(homedir(), ".codex", "schemas", name);
  if (existsSync(userPath)) return userPath;
  const bundled = join(PLUGIN_ROOT, "schemas", name);
  if (existsSync(bundled)) return bundled;
  return userPath;
}

export interface RunCodexOptions {
  profile: HeadlessProfile;
  prompt?: string;
  cwd?: string;
  structured?: boolean;
  reviewUncommitted?: boolean;
  reviewBase?: string;
  reviewCommit?: string;
  outputPath?: string;
  /** Capture JSONL + durable agent_message fallback + usage. Default true. */
  json?: boolean;
  /** Persist full JSONL stream (implies json). */
  jsonlPath?: string;
  /** Heartbeat interval while Codex runs (0 disables). Default 15000. */
  heartbeatMs?: number;
  /** Progress callback (JSONL events + heartbeats). Default: stderr. */
  onProgress?: (line: string) => void;
}

export interface RunCodexResult {
  ok: boolean;
  exitCode: number;
  content: string;
  profile: HeadlessProfile;
  command: string;
  outputPath?: string;
  contentSource: ContentSource;
  usage?: CodexUsage;
  jsonlPath?: string;
}

function defaultProgress(line: string): void {
  process.stderr.write(`${line}\n`);
}

function applyStructuredSchema(args: string[], profile: HeadlessProfile): void {
  if (profile === "review") {
    args.push("--output-schema", resolveSchema("review"));
  } else if (profile === "implement" || profile === "engineer") {
    args.push("--output-schema", resolveSchema("implement"));
  } else {
    throw new Error("structured output is not supported for probe profile");
  }
}

function applyHermeticReviewFlags(args: string[]): void {
  // Skip ~/.codex/config.toml so global MCP/plugins are not loaded.
  // Workaround: -c 'mcp_servers={}' does not clear servers (Codex merge bug).
  // Pair with --ignore-rules so project/user execpolicy .rules stay out of CI/orchestration.
  args.push("--ignore-user-config", "--ignore-rules");
}

interface ProcessResult {
  exitCode: number;
  stderr: string;
  jsonl: string;
  lastAgentMessage: string;
  usage: CodexUsage | undefined;
}

async function runProcess(
  args: string[],
  cwd: string,
  stdin: string | null,
  opts: {
    json: boolean;
    heartbeatMs: number;
    onProgress: (line: string) => void;
  },
): Promise<ProcessResult> {
  const started = Date.now();
  let lastEventAt = started;
  let lastSummary = "starting";
  let stderr = "";
  let jsonl = "";
  const parseState = {
    lastAgentMessage: "",
    usage: {
      input_tokens: 0,
      cached_input_tokens: 0,
      output_tokens: 0,
      reasoning_output_tokens: 0,
    },
    events: [] as JsonlProgressEvent[],
    parseErrors: 0,
  };

  const emit = (msg: string) => {
    opts.onProgress(`[codex-headless] ${msg}`);
  };

  return new Promise((resolve, reject) => {
    const child = spawn("codex", args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const heartbeat =
      opts.heartbeatMs > 0
        ? setInterval(() => {
            const elapsedSec = Math.round((Date.now() - started) / 1000);
            const quietSec = Math.round((Date.now() - lastEventAt) / 1000);
            emit(`+${elapsedSec}s alive last=${lastSummary} quiet=${quietSec}s`);
          }, opts.heartbeatMs)
        : null;

    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      // Forward non-empty stderr lines as soft progress (non-json mode / Codex chatter).
      if (!opts.json) {
        for (const line of text.split(/\r?\n/)) {
          const t = line.trim();
          if (t) {
            lastEventAt = Date.now();
            lastSummary = t.slice(0, 120);
            emit(`stderr ${lastSummary}`);
          }
        }
      }
    });

    if (opts.json) {
      const rl = createInterface({ input: child.stdout });
      rl.on("line", (line) => {
        jsonl += `${line}\n`;
        const event = consumeJsonlLine(line, parseState);
        if (event) {
          lastEventAt = Date.now();
          lastSummary = event.summary;
          emit(`+${Math.round((lastEventAt - started) / 1000)}s ${event.summary}`);
        }
      });
    } else {
      child.stdout.resume();
    }

    child.on("error", (err) => {
      if (heartbeat) clearInterval(heartbeat);
      reject(err);
    });

    child.on("close", (code) => {
      if (heartbeat) clearInterval(heartbeat);
      const hasUsage =
        parseState.usage.input_tokens > 0 ||
        parseState.usage.output_tokens > 0 ||
        parseState.usage.cached_input_tokens > 0 ||
        parseState.usage.reasoning_output_tokens > 0;
      resolve({
        exitCode: code ?? 1,
        stderr,
        jsonl,
        lastAgentMessage: parseState.lastAgentMessage,
        usage: hasUsage ? parseState.usage : undefined,
      });
    });

    if (stdin === null) {
      child.stdin.end();
    } else {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}

async function finishRun(
  outFile: string,
  outputPath: string | undefined,
  proc: ProcessResult,
  profile: HeadlessProfile,
  command: string,
  opts: {
    json: boolean;
    jsonlPath?: string;
    onProgress: (line: string) => void;
  },
): Promise<RunCodexResult> {
  const fileContent = await readFile(outFile, "utf8").catch(() => "");
  let content = fileContent;
  let contentSource: ContentSource = fileContent.trim()
    ? "output-file"
    : "empty";

  if (!content.trim() && proc.lastAgentMessage.trim()) {
    content = proc.lastAgentMessage;
    contentSource = "jsonl-agent-message";
  }

  if (!content.trim() && proc.exitCode !== 0) {
    throw new Error(proc.stderr.trim() || `codex exited ${proc.exitCode}`);
  }

  if (opts.jsonlPath && opts.json) {
    await writeFile(opts.jsonlPath, proc.jsonl);
  }

  if (outputPath) {
    await writeFile(outputPath, content);
  }

  if (proc.usage) {
    opts.onProgress(`[codex-headless] ${formatUsageLine(proc.usage)}`);
  }
  opts.onProgress(
    `[codex-headless] done exit=${proc.exitCode} source=${contentSource}` +
      (content.trim() ? "" : " (empty content)"),
  );

  return {
    ok: proc.exitCode === 0,
    exitCode: proc.exitCode,
    content,
    profile,
    command,
    outputPath,
    contentSource,
    usage: proc.usage,
    jsonlPath: opts.jsonlPath,
  };
}

export async function runCodexExec(opts: RunCodexOptions): Promise<RunCodexResult> {
  const workDir = opts.cwd ?? process.cwd();
  const tmp = await mkdtemp(join(tmpdir(), "codex-headless-"));
  const outFile = join(tmp, "out.txt");
  const json = opts.json !== false;
  const heartbeatMs = opts.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
  const onProgress = opts.onProgress ?? defaultProgress;

  const args = ["exec", "--profile", opts.profile, "--ephemeral", "-o", outFile];

  if (opts.profile === "review") {
    applyHermeticReviewFlags(args);
  }

  if (json) {
    args.push("--json");
  }

  if (opts.structured) {
    applyStructuredSchema(args, opts.profile);
  }

  const runOpts = { json, heartbeatMs, onProgress };
  const finishOpts = { json, jsonlPath: opts.jsonlPath, onProgress };

  let command: string;

  try {
    if (opts.reviewUncommitted) {
      args.push("review", "--uncommitted");
      command = `codex ${args.join(" ")} < /dev/null`;
      const proc = await runProcess(args, workDir, null, runOpts);
      return finishRun(outFile, opts.outputPath, proc, opts.profile, command, finishOpts);
    }

    if (opts.reviewBase) {
      args.push("review", "--base", opts.reviewBase);
      command = `codex ${args.join(" ")} < /dev/null`;
      const proc = await runProcess(args, workDir, null, runOpts);
      return finishRun(outFile, opts.outputPath, proc, opts.profile, command, finishOpts);
    }

    if (opts.reviewCommit) {
      args.push("review", "--commit", opts.reviewCommit);
      command = `codex ${args.join(" ")} < /dev/null`;
      const proc = await runProcess(args, workDir, null, runOpts);
      return finishRun(outFile, opts.outputPath, proc, opts.profile, command, finishOpts);
    }

    const prompt = opts.prompt?.trim();
    if (!prompt) {
      throw new Error(
        "prompt is required unless review_uncommitted, review_base, or review_commit is set",
      );
    }

    command = `codex ${args.join(" ")} - < prompt.txt`;
    const proc = await runProcess(args, workDir, prompt, runOpts);
    return finishRun(outFile, opts.outputPath, proc, opts.profile, command, finishOpts);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

export async function readPromptFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}

export type { CodexUsage };
