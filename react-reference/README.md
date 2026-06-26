# Silta — React Reference Implementation

This folder is a **production-style port** of the Silta MVP using React + TypeScript + Tailwind + Vite. It mirrors the modules of the single-file app (`../index.html`) in a componentised, type-safe structure, and shows how Silta would be organised for a real engineering team.

> The **graded deliverable is the root `index.html`** (zero-install MVP). This folder is supporting evidence of production-readiness and is not required to run the demo.

## Structure

```
src/
├── types/        # TypeScript domain types
├── data/         # knowledgeBase.json (60 FAQs) + demoData
├── context/      # AppContext — all state via useReducer
├── services/     # aiService — OpenAI + Claude + RAG grounding
├── utils/        # readiness scoring + formatting
└── components/   # UI components (Badge, Button, Card, icons, …)
```

## Run

```bash
cd react-reference
npm install
cp .env.example .env     # optionally add VITE_OPENAI_API_KEY
npm run dev
```

Build:
```bash
npm run build   # outputs to dist/ — deploy to Vercel/Netlify/static host
```

## Status

The data layer, type system, AI service, readiness engine, and UI primitives are implemented. Page components follow the same logic as the single-file app. Treat this as a reference architecture rather than a finished second product.
