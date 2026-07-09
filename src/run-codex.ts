import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type HeadlessProfile = "review" | "implement" | "engineer" | "probe";

export type ImplementProfile = "implement" | "engineer";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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
}

export interface RunCodexResult {
  ok: boolean;
  exitCode: number;
  content: string;
  profile: HeadlessProfile;
  command: string;
  outputPath?: string;
}

function runProcess(
  args: string[],
  cwd: string,
  stdin: string | null,
): Promise<{ exitCode: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("codex", args, { cwd, stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ exitCode: code ?? 1, stderr }));
    if (stdin === null) {
      child.stdin.end();
    } else {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
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

async function finishRun(
  outFile: string,
  outputPath: string | undefined,
  exitCode: number,
  stderr: string,
  profile: HeadlessProfile,
  command: string,
): Promise<RunCodexResult> {
  const content = await readFile(outFile, "utf8").catch(() => "");
  if (!content.trim() && exitCode !== 0) {
    throw new Error(stderr.trim() || `codex exited ${exitCode}`);
  }
  if (outputPath) {
    await writeFile(outputPath, content);
  }
  return {
    ok: exitCode === 0,
    exitCode,
    content,
    profile,
    command,
    outputPath,
  };
}

export async function runCodexExec(opts: RunCodexOptions): Promise<RunCodexResult> {
  const workDir = opts.cwd ?? process.cwd();
  const tmp = await mkdtemp(join(tmpdir(), "codex-headless-"));
  const outFile = join(tmp, "out.txt");

  const args = ["exec", "--profile", opts.profile, "--ephemeral", "-o", outFile];

  if (opts.structured) {
    applyStructuredSchema(args, opts.profile);
  }

  let command: string;

  try {
    if (opts.reviewUncommitted) {
      args.push("review", "--uncommitted");
      command = `codex ${args.join(" ")} < /dev/null`;
      const { exitCode, stderr } = await runProcess(args, workDir, null);
      return finishRun(outFile, opts.outputPath, exitCode, stderr, opts.profile, command);
    }

    if (opts.reviewBase) {
      args.push("review", "--base", opts.reviewBase);
      command = `codex ${args.join(" ")} < /dev/null`;
      const { exitCode, stderr } = await runProcess(args, workDir, null);
      return finishRun(outFile, opts.outputPath, exitCode, stderr, opts.profile, command);
    }

    if (opts.reviewCommit) {
      args.push("review", "--commit", opts.reviewCommit);
      command = `codex ${args.join(" ")} < /dev/null`;
      const { exitCode, stderr } = await runProcess(args, workDir, null);
      return finishRun(outFile, opts.outputPath, exitCode, stderr, opts.profile, command);
    }

    const prompt = opts.prompt?.trim();
    if (!prompt) {
      throw new Error(
        "prompt is required unless review_uncommitted, review_base, or review_commit is set",
      );
    }

    command = `codex ${args.join(" ")} - < prompt.txt`;
    const { exitCode, stderr } = await runProcess(args, workDir, prompt);
    return finishRun(outFile, opts.outputPath, exitCode, stderr, opts.profile, command);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

export async function readPromptFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}
