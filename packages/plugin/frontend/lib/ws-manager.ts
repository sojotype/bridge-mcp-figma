/**
 * WebSocket lifecycle: connect, send, close.
 * WebSocket lives only in the frontend (backend cannot create sockets).
 * Stub until full implementation — close() and getConnectionRef() are no-ops.
 */

export const wsManager = {
  close(): void {
    // TODO: call ws.close() when WebSocket is implemented
  },

  getConnectionRef(): WebSocket | null {
    // TODO: return ws ref when WebSocket is implemented
    return null;
  },
};
