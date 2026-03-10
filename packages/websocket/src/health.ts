import type * as Party from "partykit/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

/**
 * Health check party for the Figma plugin.
 * GET /parties/health/status returns { ok: true } when the server is up.
 */
export default class HealthParty implements Party.Server {
  readonly room: Party.Room;

  constructor(room: Party.Room) {
    this.room = room;
  }

  async onRequest(req: Party.Request): Promise<Response> {
    await Promise.resolve();
    const headers = new Headers(CORS);
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }
}
