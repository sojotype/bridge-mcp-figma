import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

/**
 * Health/status endpoint for the Figma plugin.
 * GET /mcp/status returns { ok: true } when the server is ready,
 * or { ok: false, message: "..." } when there is a problem.
 */
export function GET() {
  const host = process.env.PARTYKIT_HOST ?? "";
  const secret = process.env.BRIDGE_SECRET ?? "";

  if (!(host && secret)) {
    return NextResponse.json(
      { ok: false, message: "Bridge not configured" },
      { status: 200, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
