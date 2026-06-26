# CODEX.md — Instructions for OpenAI Codex / Cursor

> The authoritative, tool-agnostic guide is **[`AGENTS.md`](./AGENTS.md)**. Read it first. This file adds Codex/Cursor-specific notes.

## Project in one line
Silta is a single-file (`index.html`) AI-assisted mortgage origination MVP — vanilla JS, no build step, no dependencies.

## If you generate or run code here
- Keep everything inside `index.html`; do **not** scaffold a framework or add npm packages for the MVP.
- The optional generative-AI path uses the **OpenAI Chat Completions API** (`gpt-4o-mini` by default) via a user-supplied key entered in the app's *AI settings*. Relevant code: `callSilta()`.
- A `react-reference/` folder contains a production-style React/TS port if you need a componentised target — but the graded deliverable is `index.html`.

## Hard constraints (see AGENTS.md for detail)
1. No fabricated document data — figures come from real PDF text via `parseDocumentContent()`.
2. AI must never guarantee approval or give formal advice.
3. Recompute the readiness score; never store it.

## Configuration
Codex/Cursor settings live in [`.codex/`](./.codex).
