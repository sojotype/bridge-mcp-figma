import { createMcpHandler } from "mcp-handler";
import type { NextRequest } from "next/server";
import { invokeViaBridge } from "./bridge";
import { getUserHashes, requestContext } from "./request-context";
import { ALL_TOOLS, registerTools } from "./tools";

const bridgeOptions = () => ({
  host: process.env.PARTYKIT_HOST ?? "",
  secret: process.env.BRIDGE_SECRET ?? "",
});

function parseUserHashesFromUrl(url: string): string[] {
  const u = new URL(url);
  const param = u.searchParams.get("userHashes");
  if (!param) {
    return [];
  }
  return param
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function executeTool(
  name: string,
  params: unknown
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const fail = (text: string) => ({
    content: [{ type: "text" as const, text }],
  });
  try {
    const raw = params as { sessionId?: string; [k: string]: unknown };
    const sessionId =
      typeof raw.sessionId === "string" ? raw.sessionId : undefined;
    const userHashes = getUserHashes();
    if (!sessionId && userHashes.length === 0) {
      return fail(
        "Pass sessionId in the tool params, or configure the MCP server URL with userHashes=... (from the Figma plugin UI)."
      );
    }
    const opts = bridgeOptions();
    if (!(opts.host && opts.secret)) {
      return fail("Bridge not configured: set PARTYKIT_HOST and BRIDGE_SECRET");
    }
    const { sessionId: _s, ...args } = raw;
    const result = await invokeViaBridge(name, args, {
      host: opts.host,
      secret: opts.secret,
      ...(sessionId ? { sessionId } : { userHashes }),
    });
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return fail(`Error: ${message}`);
  }
}

const baseHandler = createMcpHandler(
  (server) => {
    registerTools(server, ALL_TOOLS, { execute: executeTool });
  },
  {},
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

function wrapWithRequestContext(req: NextRequest): Promise<Response> {
  const userHashes = parseUserHashesFromUrl(req.url);
  return requestContext.run({ userHashes }, () => baseHandler(req));
}

export async function GET(req: NextRequest): Promise<Response> {
  return await wrapWithRequestContext(req);
}

export async function POST(req: NextRequest): Promise<Response> {
  return await wrapWithRequestContext(req);
}

export async function DELETE(req: NextRequest): Promise<Response> {
  return await wrapWithRequestContext(req);
}
