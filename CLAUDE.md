# CLAUDE.md — Instructions for Claude / Claude Code

> Claude was the **primary agent** used to build Silta. This file is the entry point for Claude and Claude Code when working in this repository.

## Read this first
The complete, authoritative agent guide is **[`AGENTS.md`](./AGENTS.md)**. Everything below is Claude-specific; the shared rules, architecture map, and testing checklist live in `AGENTS.md`.

## Why Claude is a good fit for this project
- **Long context:** the full assignment spec (2,000+ lines) is ingested in a single pass, so Claude keeps the whole product in mind while editing one file.
- **Dutch mortgage domain knowledge:** NHG, DUO student debt, notary/Kadaster, hypotheekrenteaftrek, BKR — all handled natively in the knowledge base.
- **Single-file vanilla JS quality:** Claude produces clean, dependency-free JS/CSS without scaffolding, which suits the zero-install MVP.
- **Self-correction:** during the build Claude diagnosed and fixed real bugs (JS escaping, a readiness-score edge case, a document-classification slot conflict, and a chat fallback) using targeted edits + headless browser tests.

## Working style in this repo
1. **Edit `index.html` with surgical `str_replace`/edits** — do not rewrite the whole file.
2. **Verify JS after every change**: extract the `<script>` and run `node --check`.
3. **Test in a headless browser** (Playwright) for any behavioural change — see `AGENTS.md` testing checklist.
4. **Never** add a build step or dependencies to the MVP; **never** fabricate document figures; **never** weaken AI safety rules. (Full rationale in `AGENTS.md`.)

## Configuration
Project-level Claude settings live in [`.claude/`](./.claude).
