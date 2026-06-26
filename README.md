<div align="center">

# 🌉 Silta

### Bridging AI efficiency and human mortgage guidance

**An AI-assisted mortgage origination platform that improves the mortgage customer journey through conversational AI, intelligent document analysis, and real-time application readiness tracking.**

[Features](#-features) · [Quick Start](#-quick-start) · [Demo Walkthrough](#-demo-walkthrough) · [Architecture](#-architecture) · [AI Agents](#-ai-agent-orchestration)

</div>

---

> **Silta** means *bridge* in Finnish — the platform bridges the gap between fast, scalable AI guidance and trusted, regulated human mortgage advice.

## 📋 Table of Contents

- [Problem](#-the-problem)
- [Solution](#-the-solution)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Demo Walkthrough](#-demo-walkthrough)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [AI Agent Orchestration](#-ai-agent-orchestration)
- [Scaling, Risks & Security](#-scaling-risks--security)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 The Problem

Mortgage origination is still highly manual and slow. **Customers** wait for callbacks, struggle with terminology, upload the wrong documents, and have no visibility into where their application stands. **Mortgage advisors** spend the majority of their time answering repetitive questions and chasing paperwork — instead of giving high-value advice on complex situations.

## 💡 The Solution

Silta runs on a deliberate **hybrid AI–human model**:

| AI handles | Humans handle |
|------------|---------------|
| Mortgage education & guidance | Final review & validation |
| Document completeness checks | Regulatory compliance |
| Application readiness tracking | Complex personal situations |
| Answering common questions 24/7 | The formal mortgage recommendation |

The AI never replaces the advisor — it prepares a complete, verified application so the advisor can focus on what genuinely needs human expertise.

---

## ✨ Features

### 🏠 Mortgage Dashboard
A real banking-portal-style overview: a live **Mortgage Readiness Score** (0–100%), a six-step application progress tracker, document summaries, recent AI insights, your assigned advisor, and the dynamic **"Your Next Steps"** panel that updates after every action.

### 📁 Intelligent Document Center
- Upload one or more files per document type (e.g. three months of salary slips)
- **Real content analysis** — Silta reads the actual text of uploaded PDFs (via PDF.js), recognises the document type, and extracts the relevant figures (income, employer, balances, IBANs, dates)
- **Automatic verification verdicts** decided from content, not a toggle: `Verified`, `Wrong document`, `Outdated`, `Needs Review`, `Unreadable`, `Unsupported`
- Detects when the wrong document is uploaded (e.g. a rental agreement in the income field) and never fabricates figures it cannot read
- Self-employed flow swaps salary documents for annual accounts, tax returns and business financials

### 💬 AI Mortgage Assistant *(centrepiece)*
- Grounded answers built from a **60-entry mortgage knowledge base** + your profile + your verified document data (a retrieval-augmented approach)
- Works **out of the box** with the built-in knowledge engine — no API key required
- Optionally connect your **own OpenAI API key** (via *AI settings*) for fully generative answers
- Conversation memory, typing indicator, suggested follow-ups, copy / new chat / clear chat
- Strict safety rules: never guarantees approval, always defers final advice to the advisor
- Proactively suggests contacting an advisor when a question needs a human

### 👤 Profile & Advisor Contact
A profile that feeds personalisation (employment status dynamically changes required documents), plus a simulated advisor contact flow (message / callback / human assistance).

---

## 🚀 Quick Start

Silta's MVP is a **single self-contained HTML file** — no build step, no dependencies, no server.

### Option 1 — Just open it
```bash
# Clone the repo
git clone https://github.com/<your-username>/silta.git
cd silta

# Open the app in your browser
open index.html        # macOS
# or: xdg-open index.html   (Linux) / start index.html (Windows)
```

### Option 2 — Serve locally (recommended for the AI document reader)
```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

> **Note:** The document reader uses [PDF.js](https://mozilla.github.io/pdf.js/) loaded from a CDN, so open the app **with an internet connection** and upload **text-based PDFs** (like the files in [`demo-documents/`](./demo-documents)) for automatic content extraction. Image-only scans are honestly flagged for manual review rather than guessed.

### Connecting your own AI key (optional)
Open the **AI Assistant → AI settings** and paste an OpenAI API key (`sk-...`). It is held only in the browser session. Without a key, the assistant still answers using the built-in knowledge base.

---

## 🎬 Demo Walkthrough

Sample demo documents for a fictional customer, **Dylan Verhoeven**, are in [`demo-documents/`](./demo-documents).

1. **Dashboard** — note the readiness score and "Your Next Steps".
2. **Documents → Salary Slips** — upload the three `salary_slip_*.pdf` files. Silta reads them, confirms the type, extracts €4,250 income, and the score rises.
3. **Documents → Bank Statements** — upload `WRONG_vacation_booking_ibiza.pdf`. Silta correctly rejects it as *Not Relevant* and extracts nothing.
4. **Documents** — finish uploading `bank_statement_*.pdf`, `savings_statement_*.pdf`, `passport_*.pdf`.
5. **AI Assistant** — ask *"What documents am I still missing?"*, *"Can I afford a €350,000 home?"*, *"Which mortgage fits me?"* — answers reference your real data.
6. **Profile** — toggle to *Self-employed* and watch the required documents change.
7. **Contact advisor** — send a message and see the simulated status update.

A full video script is in [`docs/DEMO_SCRIPT.md`](./docs/DEMO_SCRIPT.md).

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Silta (browser)                      │
│                                                           │
│   Dashboard    Documents    AI Assistant    Profile       │
│   ───────────────────────────────────────────────────     │
│                  Central app state                        │
│   ───────────────────────────────────────────────────     │
│                                                           │
│   Readiness Engine        Document Analysis Engine        │
│   • computeReadiness()    • PDF.js text extraction        │
│   • nextSteps()           • content classifier (verdict)  │
│   • progressSteps()       • field parser (income, IBAN…)  │
│                                                           │
│   AI Service (RAG)                                         │
│   • searchKB()  → retrieve from 60-entry knowledge base   │
│   • buildContextBlock() → profile + verified documents    │
│   • callSilta() → OpenAI key ▸ Anthropic ▸ local answer   │
└──────────────────────────────────────────────────────────┘
                            │ (optional)
                   ┌────────┴─────────┐
                   │  OpenAI API      │  ← only if user supplies a key
                   └──────────────────┘
```

Full detail in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

### How the AI decides a document's status
1. Read the PDF text with PDF.js.
2. Score the text against keyword *fingerprints* for every document type.
3. If it clearly matches a **different** type → `Wrong document`. If it matches **this** slot → `Verified` (+ extract fields). If unreadable → honest `Needs Review`/`Unreadable` (never invents data).

---

## 🛠 Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| App shell | **Vanilla JS + HTML + CSS**, single file | Zero-install demo; opens anywhere |
| Document AI | **PDF.js** (client-side) | Real text extraction with no backend |
| Knowledge base | **Structured JSON** (60 FAQs) | Transparent, auditable retrieval |
| Generative AI | **OpenAI API** (optional) + local fallback | Works with or without a key |
| Design system | Custom CSS tokens (navy / green / grey) | Trustworthy banking aesthetic |
| Demo documents | **Python + ReportLab** | Reproducible, realistic test data |

A production-oriented **React + TypeScript + Tailwind + Vite** reference implementation of the same modules lives in [`react-reference/`](./react-reference).

---

## 📂 Project Structure

```
silta/
├── index.html                  # ← the complete MVP (open this)
├── README.md
├── LICENSE
├── CLAUDE.md  CODEX.md  GEMINI.md  AGENTS.md   # agent instructions
├── .claude/ .codex/ .gemini/ .agents/          # agent config
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEMO_SCRIPT.md
│   └── KNOWLEDGE_BASE.md
├── demo-documents/             # realistic sample PDFs for the demo
├── scripts/
│   └── generate_demo_documents.py
└── react-reference/            # production-style React/TS implementation
```

---

## 🤖 AI Agent Orchestration

This project was developed using **Claude (Anthropic)** as the primary AI coding agent. Agent instruction files are provided for four ecosystems so any tool can pick up the project:

| File | Agent |
|------|-------|
| [`CLAUDE.md`](./CLAUDE.md) + [`.claude/`](./.claude) | Claude / Claude Code |
| [`CODEX.md`](./CODEX.md) + [`.codex/`](./.codex) | OpenAI Codex / Cursor |
| [`GEMINI.md`](./GEMINI.md) + [`.gemini/`](./.gemini) | Google Gemini |
| [`AGENTS.md`](./AGENTS.md) + [`.agents/`](./.agents) | Generic / multi-agent |

**Why Claude?** Long-context comprehension of the full spec in one pass, strong native Dutch-mortgage domain knowledge (NHG, DUO, notary, hypotheekrenteaftrek), high-quality single-file vanilla JS without scaffolding, and reliable self-correction of bugs during the build. See [`AGENTS.md`](./AGENTS.md) for the orchestration model.

---

## 📈 Scaling, Risks & Security

**To scale out:** replace client-side PDF.js with a server-side OCR/document-AI service (Azure Document Intelligence, AWS Textract) for scanned documents; add bank-grade auth (iDIN, MFA); move state to an encrypted database; cache common AI answers to control cost; add a per-lender affordability rule engine.

**Technical risks:** LLM hallucination (mitigated by strict grounding + safety prompts + advisor-in-the-loop); document-model drift as lender rules change; client-side extraction limited to text PDFs.

**Security:** documents stay in-session in the MVP; production requires encryption at rest/in transit, GDPR-compliant EU data residency, PII minimisation before any LLM call, and prompt-injection hardening. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#security).

---

## 🗺 Roadmap

- [ ] Server-side OCR for scanned documents
- [ ] PSD2 open-banking for auto-verified statements
- [ ] Multi-lender affordability calculator
- [ ] Dutch / English language toggle
- [ ] Advisor-side dashboard (out of MVP scope)

---

## 📄 License

Released under the [MIT License](./LICENSE).

Demo documents and the customer "Dylan Verhoeven" are entirely fictional and for demonstration only.

---

<div align="center">
Built with <a href="https://claude.ai">Claude</a> · Dutch mortgage domain modelled on AFM / NHG / DUO public guidance
</div>
