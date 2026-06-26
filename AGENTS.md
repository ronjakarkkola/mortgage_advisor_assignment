# AGENTS.md — Agent Instructions for Silta

Generic instruction file for any AI coding agent working on the Silta codebase. Tool-specific variants exist as `CLAUDE.md`, `CODEX.md`, and `GEMINI.md` (all reference this file).

## What Silta is

Silta is an **AI-assisted mortgage origination platform** delivered as a **single self-contained HTML file** (`index.html`). It has no backend, no build step, and no package dependencies for the MVP. It demonstrates a hybrid AI–human mortgage journey across four pages: Dashboard, Documents, AI Assistant, Profile.

## Golden rules

1. **The MVP is one file.** `index.html` must stay self-contained — vanilla JS, inline CSS, inline SVG icons. Do **not** introduce a bundler, npm packages, or external JS (the only external resources are Google Fonts and the PDF.js CDN).
2. **Never fabricate document data.** Document figures (income, balances) must come from real extracted PDF text. If text cannot be read, the status is an honest `needs_review`/`unreadable` — never invent numbers.
3. **Never weaken the AI safety rules.** The assistant must never guarantee approval, claim qualification, or give formal advice. It always defers final decisions to the human advisor.
4. **Readiness score is derived, never stored.** Always recompute from `state.profile` + `state.documents`.
5. **Keep the design system.** Navy / soft-green / grey, Manrope + Inter + IBM Plex Mono, custom inline SVG icons. No robot/crypto/generic-chatbot aesthetics.

## Architecture map (`index.html`)

| Area | Key functions |
|------|---------------|
| State | single `state` object; every action mutates it and calls `renderAll()` |
| Readiness | `computeReadiness()`, `nextSteps()`, `progressSteps()`, `applicationStatusLabel()` |
| Documents | `handleFileInput()`, `readPdfText()`, `classifyDocument()`, `parseDocumentContent()`, `finishAnalysisMulti()` |
| AI | `callSilta()` → OpenAI key ▸ Anthropic ▸ `localAnswer()`; `searchKB()`, `buildContextBlock()` |
| Knowledge base | `KB` array, 60 entries, `{c,q,a,t}` |
| Rendering | `renderDashboard()`, `renderDocuments()`, `renderAssistant()`, `renderProfile()` |

## Document analysis flow

```
upload → readPdfText() (PDF.js)
       → classifyDocument(docId, file, text)
            ├ unsupported / wrong / unreadable / outdated  → flagged, no extraction
            └ verified / needs_review                      → parseDocumentContent() extracts fields
       → finishAnalysisMulti() aggregates multi-file verdict, updates state
```

`classifyDocument()` scores text against `DOC_FINGERPRINTS` and picks the best-matching document type. A document that matches a *different* slot is rejected as `wrong`.

## AI service flow

`callSilta(userText)`:
1. `searchKB()` retrieves top-4 knowledge-base entries.
2. `buildContextBlock()` adds profile + verified-document context.
3. If the user supplied an OpenAI key → call OpenAI.
4. Else try the Anthropic endpoint (works inside claude.ai preview).
5. Else `localAnswer()` produces a grounded reply from the KB + context. **This guarantees the chat always responds**, even offline.

## Coding conventions

- Vanilla JS only in `index.html`; assemble HTML via string concatenation; escape user input with `esc()`.
- Money via `fmtMoney()`; times via `fmtTime()` / `fmtTimeAgo()`.
- Icons via `ic(name, size)` (inline SVG set). No icon libraries.
- CSS via custom properties (`var(--navy-900)` etc.). Avoid inline styles except small layout tweaks.

## Testing checklist (manual)

- [ ] Upload the demo salary slips → `Verified`, real income extracted.
- [ ] Upload `WRONG_vacation_booking_ibiza.pdf` to any slot → `Wrong document`, no figures.
- [ ] Upload a bank statement into the salary slot → rejected as wrong slot.
- [ ] Empty application → readiness 0%.
- [ ] AI Assistant answers with no API key (local fallback) and with a key (OpenAI).
- [ ] Profile employed → self-employed swaps required documents.

## Orchestration model

This project was built primarily with **Claude**. The single-agent approach was chosen deliberately: the full specification fits in one context window, so continuity of context outperformed multi-agent parallelism for this scope. The workflow was:

```
spec (PDF) → Claude → index.html (rapid MVP)
                    → iterative bug-fixes (str_replace, browser tests)
                    → demo-documents (Python/ReportLab)
                    → docs + agent files + React reference
```

When extending with multiple agents, split by **surface area** (e.g. one agent on the document engine, one on the AI service) and use this file plus `docs/ARCHITECTURE.md` as the shared contract.
