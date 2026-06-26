# Architecture

This document explains how Silta is built and how its conceptual innovation — a **hybrid AI–human mortgage journey** — maps into code.

## 1. Overview

Silta's MVP is a **single-file front-end application** (`index.html`). It deliberately avoids a backend so it can be opened or hosted anywhere with zero install. All logic — state, rendering, document analysis, and AI grounding — runs in the browser.

```
┌──────────────────────────── Browser ─────────────────────────────┐
│                                                                   │
│  Pages:  Dashboard │ Documents │ AI Assistant │ Profile           │
│                       ▲                                            │
│                       │ renderAll()                               │
│  ┌─────────────────── state ───────────────────┐                  │
│  │ profile · documents · conversation ·         │                 │
│  │ insights · advisor · readiness (derived)     │                 │
│  └──────────────────────────────────────────────┘                 │
│        │                  │                   │                    │
│  Readiness Engine   Document Engine     AI Service (RAG)           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                                   │ optional
                          ┌────────┴─────────┐
                          │   OpenAI API     │
                          └──────────────────┘
```

## 2. Frontend layer

- **Rendering model:** a single `state` object is the source of truth. Every user action mutates `state` and calls `renderAll()`, which re-renders the active page. No virtual DOM — chosen for transparency and zero dependencies.
- **Design system:** CSS custom properties define a banking palette (navy, soft green, grey). Typography is Manrope (display), Inter (body), IBM Plex Mono (figures). Icons are a hand-built inline SVG set (`ic()`), avoiding any icon library and the "generic chatbot/robot" aesthetic.
- **UX principle — "always know what's next":** the dynamic *Your Next Steps* panel and the readiness score are recomputed after every event so the customer is never left wondering what to do.

## 3. Document analysis engine

This is where the conceptual innovation is most visible: **the AI reads and judges real documents, but a human validates.**

```
handleFileInput(docId, files)
  └─ for each file: readPdfText(file)         // PDF.js → real text
  └─ finishAnalysisMulti()
        └─ classifyDocument(docId, file, text)
              • score text vs DOC_FINGERPRINTS (per type)
              • pick best-matching type
              • verdict: verified | wrong | outdated | unreadable |
                         unsupported | needs_review
        └─ if verified/needs_review/outdated:
              parseDocumentContent(docId, text)  // extract real fields
        └─ aggregate multi-file verdict, update state, recompute readiness
```

Key properties:
- **Content-driven, not filename-driven.** The verdict comes from the document's text. Filenames are only a fallback when no text can be read.
- **No fabrication.** If text can't be read (e.g. an image-only scan), the document is honestly flagged `needs_review` / `unreadable`; Silta never invents an income figure.
- **Wrong-slot detection.** A bank statement uploaded into the salary-slip field is rejected because it scores higher as a bank statement.
- **Field extraction** parses euro amounts (NL/EN formats), employer names, IBANs, periods/dates, and labelled values (gross/net, balances, outstanding debt).

## 4. AI layer (Retrieval-Augmented Generation)

The assistant grounds every answer in three context sources before responding:

1. **Mortgage Knowledge Base** — 60 structured FAQ entries (`KB`), retrieved by `searchKB()` via keyword + tag scoring (a lightweight RAG retriever).
2. **Customer Profile** — name, employment status, target property, goals.
3. **Document Context** — figures extracted from *verified* documents, the readiness score, and missing/attention items, assembled by `buildContextBlock()`.

`callSilta()` then resolves an answer through a **three-tier fallback** so the chat always works:

| Tier | Condition | Path |
|------|-----------|------|
| 1 | User supplied an OpenAI key | OpenAI Chat Completions (`gpt-4o-mini`) |
| 2 | Running inside claude.ai preview | Anthropic Messages endpoint |
| 3 | Always available | `localAnswer()` — grounded reply from KB + context, no network |

Tier 3 is what makes the demo robust on GitHub Pages or offline: even with no key and no network, the assistant gives a relevant, safety-compliant answer built from the same knowledge base and document context.

### Conversation memory
The last ~10 non-proactive turns are replayed to the model each call, giving session memory without persistence.

### Safety
The system prompt (and the local answerer) enforce: no approval guarantees, no formal advice, required hedging language ("Based on the information currently available…", "A mortgage advisor will validate…"), and proactive hand-off to the human advisor for anything sensitive.

## 5. Readiness engine

`computeReadiness()` is a **pure function** of profile + documents:

| Component | Points |
|-----------|--------|
| Profile complete | 10 |
| Salary slips verified (employed) | 20 |
| Employment contract verified (employed) | 20 |
| Annual accounts + tax returns (self-employed) | 10 |
| Business financials (self-employed) | 20 |
| Bank statements verified | 20 |
| Savings statement verified | 10 |
| Identity verified | 10 |
| No outstanding issues (once ≥1 doc uploaded) | 10 |

The score, progress steps, application status, and next steps are all derived on demand — never stored — so the UI can never drift out of sync with the underlying state.

## 6. Future RAG / production evolution

The current retriever is keyword/tag based over a JSON KB. The natural production path is:
- Embed the KB and document chunks into a vector store; retrieve by semantic similarity.
- Replace client-side PDF.js with a server OCR/document-AI service for scans.
- Add a retrieval cache for common questions to cut LLM cost.
- Introduce a per-lender affordability rule engine the AI can call as a tool.

## Security

- **MVP:** documents and answers stay in the browser session; nothing is persisted server-side. An OpenAI key, if entered, is held only in memory for the session and sent only to OpenAI.
- **Production requirements:** encryption at rest and in transit; GDPR-compliant EU data residency; PII minimisation before any LLM call; prompt-injection hardening on document-derived text; bank-grade authentication (iDIN, MFA); audit logging of advisor actions.
