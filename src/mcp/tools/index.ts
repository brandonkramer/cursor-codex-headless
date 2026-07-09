import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCodexExec } from "../../run-codex.ts";

const cwdField = z
  .string()
  .optional()
  .describe("Working directory (defaults to server cwd)");

const promptField = z
  .string()
  .optional()
  .describe("Self-contained Codex prompt. Required unless using built-in review flags.");

function toolResult(result: Awaited<ReturnType<typeof runCodexExec>>) {
  return {
    content: [{ type: "text" as const, text: result.content }],
    structuredContent: { ...result },
  };
}

export function registerCodexHeadlessTools(server: McpServer): void {
  server.registerTool(
    "codex_headless_review",
    {
      description:
        "Read-only Codex review via codex exec --profile review --ephemeral (gpt-5.6-sol, ultra). Use review_uncommitted/review_base for built-in diff review, or prompt for custom scope. Set structured=true for reviewer-verdict JSON schema.",
      inputSchema: {
        prompt: promptField,
        cwd: cwdField,
        structured: z.boolean().optional().default(false),
        review_uncommitted: z.boolean().optional().default(false),
        review_base: z.string().optional().describe("Base branch for codex exec review --base"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ prompt, cwd, structured, review_uncommitted, review_base }) =>
      toolResult(
        await runCodexExec({
          profile: "review",
          prompt,
          cwd,
          structured,
          reviewUncommitted: review_uncommitted,
          reviewBase: review_base,
        }),
      ),
  );

  server.registerTool(
    "codex_headless_implement",
    {
      description:
        "Codex implementation via codex exec --profile implement --ephemeral (gpt-5.6-terra, high, workspace-write). Set structured=true for implement-report JSON schema.",
      inputSchema: {
        prompt: z.string().min(1),
        cwd: cwdField,
        structured: z.boolean().optional().default(false),
      },
      annotations: { destructiveHint: true },
    },
    async ({ prompt, cwd, structured }) =>
      toolResult(
        await runCodexExec({
          profile: "implement",
          prompt,
          cwd,
          structured,
        }),
      ),
  );

  server.registerTool(
    "codex_headless_probe",
    {
      description:
        "Cheap Codex exploratory pass via codex exec --profile probe --ephemeral (gpt-5.6-luna, medium, read-only). Rerun on implement/review before shipping.",
      inputSchema: {
        prompt: z.string().min(1),
        cwd: cwdField,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ prompt, cwd }) =>
      toolResult(await runCodexExec({ profile: "probe", prompt, cwd })),
  );
}
