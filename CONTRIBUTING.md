# Contributing to Silta

Thanks for your interest in Silta. This project is a university FinTech MVP; contributions and forks are welcome under the MIT license.

## Ground rules

Before changing code, read [`AGENTS.md`](./AGENTS.md) — it documents the architecture and the non-negotiable guardrails:

1. **The MVP stays a single file** (`index.html`) — vanilla JS, no build step, no npm packages.
2. **Never fabricate document data** — figures must be extracted from real PDF text.
3. **Never weaken the AI safety rules** — no approval guarantees; the human advisor owns final decisions.
4. **Recompute the readiness score** from state; never store it.

## Workflow

1. Fork and branch (`feature/...` or `fix/...`).
2. Make focused changes; comment non-obvious logic.
3. Verify the JavaScript: extract the `<script>` from `index.html` and run `node --check`.
4. Manually test the affected flow (see the checklist in `AGENTS.md`).
5. Open a pull request describing what changed and why.

## Working with AI agents

This repo is agent-friendly. If you use Claude, Codex/Cursor, or Gemini, point the agent at the matching instruction file (`CLAUDE.md`, `CODEX.md`, `GEMINI.md`) — all of which build on `AGENTS.md`.
