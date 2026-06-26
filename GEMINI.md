# GEMINI.md — Instructions for Google Gemini

> Start with the shared guide **[`AGENTS.md`](./AGENTS.md)**. This file adds Gemini-specific notes.

## Project summary
Silta is an AI-assisted mortgage origination MVP delivered as a single self-contained `index.html` (vanilla JS, no build, no dependencies). Four pages: Dashboard, Documents, AI Assistant, Profile. Hybrid AI–human model.

## Working rules (full detail in AGENTS.md)
- Keep the MVP a single file; no bundler or packages.
- Document figures must be extracted from real PDF text — never invented.
- Preserve the AI safety rules (no approval guarantees, advisor-in-the-loop).
- Recompute the readiness score from state; never persist it.

## Good tasks for Gemini here
- Expanding the `KB` knowledge base (keep the `{c,q,a,t}` shape and Dutch-market accuracy).
- Improving document `DOC_FINGERPRINTS` / `parseDocumentContent()` field extraction.
- Accessibility and copy review of the UI.

## Configuration
Gemini settings live in [`.gemini/`](./.gemini).
