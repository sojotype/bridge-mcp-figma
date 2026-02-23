# ADR: Auth and login flow (email + Figma OAuth)

**Status:** Proposed  
**Date:** 2026-02-23

## Context

- Initial MVP used only a session ID from the Figma plugin as a routing key for the PartyKit room.
- There was no per-user authentication beyond a shared `BRIDGE_SECRET` between the MCP server and the bridge.
- We now want:
  - A unified login and registration flow for both the MCP client and the Figma plugin.
  - Two auth paths: email/password and Figma OAuth.
  - A persistent user identity (user token) instead of passing raw session IDs around.

## Decision

- Introduce a dedicated auth backend (Next.js app) using an external auth provider (e.g. Appwrite) as the **source of truth for users**.
- Support two login paths:
  - **Email**: email/password registration and login.
  - **Figma OAuth**: redirect to Figma, then back to the Next.js app, which exchanges the code and then **always collects an email** before finalizing the account (no “Figma-only” accounts).
- Issue a **user token** (e.g. JWT or access token) that is shared between:
  - MCP client (`mcp login`).
  - Figma plugin UI.
  - Bridge backend (PartyKit + MCP server).
- Keep **session ID** as a transport identifier only:
  - Plugin connects to PartyKit room = `sessionId`.
  - PartyKit stores `sessionId → userId` mapping based on the validated user token.

## Implications

- MCP tools no longer treat `sessionId` as a user identifier; they rely on:
  - `sessionId` for routing to the correct plugin instance.
  - user token / resolved `userId` for per-user behavior and permissions.
- Plugin UI becomes the single place where users choose the auth method (Email vs Figma OAuth) and complete the flow via the Next.js app.
- `mcp login` reuses the same auth backend, so both MCP and plugin see the same user identity.

## Email and Figma linking flow

- **User model**:
  - One logical user account is anchored by an email address.
  - A user may have multiple Figma identities (multiple `figmaUserId` values) linked to the same email.
- **Email registration**:
  - User signs up with email/password → create user with that email.
  - After registration, optionally offer “Link Figma account” → Figma OAuth → attach new Figma identity to this user.
- **Figma OAuth (first-time, no existing Figma identity)**:
  1. Redirect to Figma and obtain `figmaUserId`.
  2. If an identity with this `figmaUserId` exists → log in as that user.
  3. If not, ask the user to **enter an email**:
     - If the email is **not used** by any account:
       - Create a new user with that email and attach `figmaUserId` to it.
     - If the email **already belongs** to another account:
       - Show the email in a partially masked form (e.g. `j***@example.com`) and explain:
         - “This email is already linked to another account.”
         - Offer two options:
           - **Link this Figma account** to the existing user with that email.
           - Or **enter a different email** if the user wants a separate account for this Figma identity.
- This guarantees that every Figma OAuth-based login is associated with an email, and multiple Figma accounts can be explicitly linked to the same email-based user.

## Multi-session behavior

- The bridge (PartyKit server) maintains an in-memory mapping `userId → [sessionId...]` with optional metadata per session (e.g. `documentName`, `fileKey`).
- MCP-server and plugin use this mapping to simplify UX:
  - **0 active sessions for user**:
    - A tool invocation without `sessionId` fails with an error like
      `"No active Figma plugin sessions found for this user. Open the plugin in a Figma file and try again."`
  - **1 active session for user**:
    - MCP-server allows invoking tools **without** specifying `sessionId`.
    - It transparently routes the call to the single active `sessionId`.
    - Plugin UI does **not** show any “copy session ID” control in this state.
  - **>1 active sessions for user**:
    - MCP-server rejects tool calls that omit `sessionId` with a structured error that includes a list of choices:
      - `sessionId`
      - `documentName` and/or `fileKey` (if available)
    - This allows the assistant to say e.g.
      `"Multiple plugin sessions are active. Choose one: (A – Home page), (B – Design system)."`
    - Plugin UI in **all** active sessions for that user switches to a “multi-session” mode and shows a visible `sessionId` (with a copy button) so the user can paste it into MCP if needed.

