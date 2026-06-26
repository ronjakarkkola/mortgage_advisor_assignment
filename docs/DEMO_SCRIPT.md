# Demo Script (≤ 10 minutes)

A suggested running order for the assignment video. Sample documents are in [`../demo-documents/`](../demo-documents). Open `index.html` **with an internet connection** so the PDF reader (PDF.js) loads.

> Fictional customer used throughout: **Dylan Verhoeven** — €4,250/month income, permanent contract at Tech Company BV, €28,000 savings, €7,500 student debt, targeting a €350,000 home in Amsterdam.

---

## 0. Hook (30s) — investor framing
"Mortgage origination is slow and manual. Customers wait for callbacks and upload the wrong documents; advisors spend their time on admin instead of advice. Silta is an AI layer that prepares a complete, verified application — while keeping the human advisor responsible for the final decision."

## 1. Dashboard (1 min) — main features
- Show the **Mortgage Readiness Score** and the six-step **Application Progress**.
- Highlight **Your Next Steps** — the panel that always tells the customer what to do next.
- Point out the **AI + Human Hybrid** badge and the assigned advisor.

## 2. Document Center — real analysis (2.5 min)
- Open **Documents**. Explain: "Silta reads the actual document, decides if it's the right one, and extracts the figures — there's no manual toggle."
- **Salary Slips:** upload the three `salary_slip_*.pdf` files at once. Show: status becomes **Verified**, income €4,250 is read **from the file**, and the readiness score rises with a proactive AI insight.
- **Wrong document:** upload `WRONG_vacation_booking_ibiza.pdf` into Bank Statements. Show it is rejected as **Not Relevant** with no figures invented.
- **Finish the set:** `bank_statement_*.pdf`, `savings_statement_june_2025.pdf`, `passport_dylan_verhoeven.pdf`. Watch the score climb and steps tick off.
- *(Optional)* Mention: image-only scans are honestly flagged for manual review — production would add OCR.

## 3. AI Assistant — the centrepiece (2.5 min)
Ask, in order:
1. **"What documents am I still missing?"** → references the real uploaded/missing list.
2. **"Can I afford a €350,000 home?"** → hedged answer using the extracted €4,250 income; defers to advisor.
3. **"Which mortgage fits me — annuity or linear?"** → explains both, personalises, shows the **"Send this to my advisor"** button.
4. **"I'm worried I won't get approved."** → reassurance without promises.
- Note: works with the **built-in knowledge base** (no key). Optionally open **AI settings** and add an OpenAI key to show fully generative answers.

## 4. Profile & personalisation (1 min)
- Open **Profile**, switch **Employment status → Self-employed**.
- Return to **Documents**: required documents have changed to **annual accounts / tax returns / business financials**. This shows the personalisation engine driving the journey.

## 5. Contact advisor (30s)
- Click **Contact advisor**, send a message, show the simulated **Sent → Received by advisor** status. Reinforce the hybrid model.

## 6. Architecture & agents (1.5 min) — for the technical/agent part
- Summarise the architecture (one diagram from `docs/ARCHITECTURE.md`): state → readiness engine + document engine + RAG AI service.
- Explain the **three-tier AI fallback** (OpenAI key ▸ Anthropic ▸ local KB answer) and why the chat always works.
- State the coding agent used: **Claude** — long context for the full spec, strong Dutch-mortgage knowledge, high-quality single-file output, self-correcting. Mention the `CLAUDE.md`/`AGENTS.md` orchestration files.

## Closing (15s)
"Silta turns a slow, opaque process into a guided, transparent journey — AI does the preparation, humans make the decisions."
