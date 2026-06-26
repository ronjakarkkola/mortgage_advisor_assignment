# Changelog

All notable changes to Silta are documented here. This project was developed iteratively with the Claude coding agent; each entry corresponds to a development milestone.

## [0.5.0] — Document analysis becomes content-driven
### Changed
- **Removed the "simulate analysis" toggle entirely.** Document status is now decided automatically by analysing the actual uploaded file.
- Added a content classifier (`classifyDocument`) that scores PDF text against per-type keyword fingerprints and picks the best-matching document type.
### Fixed
- Documents are no longer assigned fabricated figures. If a file's text cannot be read, it is honestly flagged for manual review instead of inventing an income value.
- A bank statement uploaded into the salary-slip field is now correctly rejected as the wrong document.

## [0.4.0] — Real PDF reading & multi-file uploads
### Added
- Client-side PDF text extraction via PDF.js (`readPdfText`).
- Field parser (`parseDocumentContent`) for income, employer, IBAN, balances, periods — extracted from the real document text.
- Support for uploading multiple files per document type (e.g. three salary slips), each listed with its own status.

## [0.3.0] — Resilient AI assistant
### Added
- Three-tier AI fallback in `callSilta`: user OpenAI key ▸ Anthropic endpoint ▸ local knowledge-base answer.
- `localAnswer` grounded generator so the chat always responds, even with no key or no network.
- In-app **AI settings** to connect a personal OpenAI key (session-only).
### Fixed
- Chat no longer shows "having trouble responding" when opened outside the claude.ai preview.

## [0.2.0] — Document edge cases & readiness fixes
### Added
- Edge-case handling: wrong document, outdated, incomplete, unreadable, duplicate, unsupported, conflicting income.
- Demo document generator (`scripts/generate_demo_documents.py`) producing 11 realistic sample PDFs.
### Fixed
- Readiness score correctly starts at 0% on an empty application (no spurious "no issues" bonus).

## [0.1.0] — Initial MVP
### Added
- Four pages: Dashboard, Documents, AI Assistant, Profile.
- Mortgage readiness scoring, application progress, and the dynamic "Your Next Steps" panel.
- 60-entry mortgage knowledge base with keyword/tag retrieval (RAG grounding).
- Hybrid AI–human framing, advisor contact flow, design system (navy/green/grey, custom SVG icons).
