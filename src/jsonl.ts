/**
 * Parse Codex `exec --json` JSONL streams (OpenAI non-interactive event format).
 */

export interface CodexUsage {
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
  reasoning_output_tokens: number;
}

export type JsonlProgressKind =
  | "thread.started"
  | "turn.started"
  | "turn.completed"
  | "turn.failed"
  | "item.started"
  | "item.completed"
  | "error"
  | "other";

export interface JsonlProgressEvent {
  kind: JsonlProgressKind;
  summary: string;
  rawType?: string;
}

export interface JsonlParseResult {
  lastAgentMessage: string;
  usage: CodexUsage | undefined;
  events: JsonlProgressEvent[];
  lineCount: number;
  parseErrors: number;
}

const EMPTY_USAGE: CodexUsage = {
  input_tokens: 0,
  cached_input_tokens: 0,
  output_tokens: 0,
  reasoning_output_tokens: 0,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function addUsage(acc: CodexUsage, next: unknown): CodexUsage {
  const u = asRecord(next);
  if (!u) return acc;
  return {
    input_tokens: acc.input_tokens + num(u.input_tokens),
    cached_input_tokens: acc.cached_input_tokens + num(u.cached_input_tokens),
    output_tokens: acc.output_tokens + num(u.output_tokens),
    reasoning_output_tokens:
      acc.reasoning_output_tokens + num(u.reasoning_output_tokens),
  };
}

function itemSummary(item: Record<string, unknown> | null): string {
  if (!item) return "item";
  const type = typeof item.type === "string" ? item.type : "item";
  if (type === "command_execution" && typeof item.command === "string") {
    const cmd = item.command.replace(/\s+/g, " ").trim();
    return `command_execution ${cmd.slice(0, 120)}`;
  }
  if (type === "agent_message") return "agent_message";
  if (type === "reasoning") return "reasoning";
  if (type === "file_change") return "file_change";
  if (type === "mcp_tool_call" && typeof item.tool === "string") {
    return `mcp_tool_call ${item.tool}`;
  }
  return type;
}

function classify(type: string): JsonlProgressKind {
  switch (type) {
    case "thread.started":
    case "turn.started":
    case "turn.completed":
    case "turn.failed":
    case "item.started":
    case "item.completed":
    case "error":
      return type;
    default:
      return "other";
  }
}

function summarizeEvent(type: string, obj: Record<string, unknown>): string {
  switch (type) {
    case "thread.started":
      return typeof obj.thread_id === "string"
        ? `thread ${obj.thread_id.slice(0, 8)}…`
        : "thread.started";
    case "turn.started":
      return "turn.started";
    case "turn.completed": {
      const u = asRecord(obj.usage);
      if (!u) return "turn.completed";
      return `turn.completed in=${num(u.input_tokens)} out=${num(u.output_tokens)}`;
    }
    case "turn.failed":
      return typeof obj.error === "string"
        ? `turn.failed ${obj.error.slice(0, 80)}`
        : "turn.failed";
    case "item.started":
    case "item.completed":
      return `${type} ${itemSummary(asRecord(obj.item))}`;
    case "error":
      return typeof obj.message === "string"
        ? `error ${obj.message.slice(0, 80)}`
        : "error";
    default:
      return type;
  }
}

/** Process one JSONL line; returns null for blank lines. */
export function consumeJsonlLine(
  line: string,
  state: {
    lastAgentMessage: string;
    usage: CodexUsage;
    events: JsonlProgressEvent[];
    parseErrors: number;
  },
): JsonlProgressEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let obj: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    const record = asRecord(parsed);
    if (!record || typeof record.type !== "string") {
      state.parseErrors += 1;
      return null;
    }
    obj = record;
  } catch {
    state.parseErrors += 1;
    return null;
  }

  const type = obj.type as string;
  if (type === "turn.completed") {
    state.usage = addUsage(state.usage, obj.usage);
  }

  if (type === "item.completed") {
    const item = asRecord(obj.item);
    if (
      item &&
      item.type === "agent_message" &&
      typeof item.text === "string" &&
      item.text.trim()
    ) {
      state.lastAgentMessage = item.text;
    }
  }

  const kind = classify(type);
  const event: JsonlProgressEvent = {
    kind,
    summary: summarizeEvent(type, obj),
    rawType: type,
  };
  // Keep a bounded ring for debugging; heartbeats use the latest event.
  if (state.events.length < 200) {
    state.events.push(event);
  }
  return event;
}

export function parseJsonl(text: string): JsonlParseResult {
  const state = {
    lastAgentMessage: "",
    usage: { ...EMPTY_USAGE },
    events: [] as JsonlProgressEvent[],
    parseErrors: 0,
  };
  const lines = text.split(/\r?\n/);
  let lineCount = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    lineCount += 1;
    consumeJsonlLine(line, state);
  }
  const hasUsage =
    state.usage.input_tokens > 0 ||
    state.usage.output_tokens > 0 ||
    state.usage.cached_input_tokens > 0 ||
    state.usage.reasoning_output_tokens > 0;
  return {
    lastAgentMessage: state.lastAgentMessage,
    usage: hasUsage ? state.usage : undefined,
    events: state.events,
    lineCount,
    parseErrors: state.parseErrors,
  };
}

export function formatUsageLine(usage: CodexUsage): string {
  return (
    `usage input=${usage.input_tokens} cached=${usage.cached_input_tokens} ` +
    `output=${usage.output_tokens} reasoning=${usage.reasoning_output_tokens}`
  );
}
