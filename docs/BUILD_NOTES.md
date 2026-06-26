# Build Notes

Recent engineering milestones (most recent first):

- **Content-driven document analysis.** Removed the manual "simulate result" toggle; document status is now determined by analysing real PDF content via a keyword-fingerprint classifier. Documents whose text cannot be read are honestly flagged for manual review rather than assigned fabricated figures.
- **Resilient AI assistant.** Introduced a three-tier response strategy (user OpenAI key ▸ Anthropic endpoint ▸ local knowledge-base answer) so the chat always responds — including on GitHub Pages or offline — and added in-app AI settings for a personal key.

See `CHANGELOG.md` for the full history.
