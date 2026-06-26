# Publishing this repo to GitHub

This bundle already contains a full git history (10 commits). To publish it:

```bash
# 1. Unzip and enter the folder
unzip silta-github-repo.zip -d silta
cd silta

# 2. Create a new EMPTY repo on github.com (no README/license), then:
git remote add origin https://github.com/<your-username>/silta.git
git branch -M main
git push -u origin main
```

## Repository settings to apply on GitHub

**Description** (Settings → top of repo):
> Silta — an AI-assisted mortgage origination MVP. A single-file web app with a conversational AI mortgage assistant, real PDF document analysis, and live application readiness tracking, built on a hybrid AI–human model.

**Topics** (click the ⚙ next to "About"):
`fintech` `mortgage` `ai-assistant` `rag` `document-analysis` `pdf-js` `vanilla-javascript` `mvp` `openai` `knowledge-base` `customer-journey` `hybrid-ai` `netherlands` `university-project`

## Enable the live demo (GitHub Pages)

Settings → Pages → Source: `main` branch, `/ (root)` → Save.
Your app will be live at `https://<your-username>.github.io/silta/`.

> Open the live demo with internet access so the PDF reader (PDF.js) loads. Upload the files in `demo-documents/` for the full experience.
