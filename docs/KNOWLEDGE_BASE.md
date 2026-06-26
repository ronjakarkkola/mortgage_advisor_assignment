# Knowledge Base

Silta's AI assistant is grounded in a structured mortgage knowledge base of **60 FAQ entries** embedded in `index.html` as the `KB` array. Each entry has the shape:

```js
{ c: 'category', q: 'Question?', a: 'Answer.', t: ['tag', 'tag'] }
```

## Categories

| Category (`c`) | Topic | Examples |
|----------------|-------|----------|
| `basics` | Mortgage fundamentals | What is a mortgage, NHG, loan-to-value, gross vs net cost |
| `products` | Mortgage products | Annuity, linear, interest-only, fixed vs variable rate, bridging |
| `process` | Application journey | Application steps, AI review, advisor review, valuation, notary, closing costs |
| `documents` | Required documents | Salary slips, contracts, bank statements, savings, self-employed docs |
| `affordability` | What you can borrow | Income multiples, savings, debt impact, student debt, joint income |
| `platform` | How Silta works | Hybrid model, readiness score, data handling, AI limits |

## Retrieval

`searchKB(query, topK)` scores every entry by:
- +1 for each query word found in the question, answer, or tags
- +2 for each tag that appears in the query

The top `topK` entries (default 4) are injected into the AI system prompt as grounding context. This is a lightweight, transparent retrieval-augmented-generation (RAG) approach — easy to audit and extend.

## Market accuracy

The knowledge base is modelled on the **Dutch mortgage market** and references real concepts: NHG (Nationale Hypotheek Garantie), DUO student debt, BKR credit register, hypotheekrenteaftrek (mortgage interest deduction), the notary/Kadaster process, and the 100% loan-to-value limit. Figures and thresholds are indicative and should be validated against current AFM/NHG guidance before any production use.

## Extending the knowledge base

Add new `{c, q, a, t}` objects to the `KB` array. Keep tags specific and use terms customers actually search for, so retrieval scores well. Maintain the safety framing — answers should educate and guide, never promise approval or give formal advice.
