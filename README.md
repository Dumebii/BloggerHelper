# ⚡ Ozigi — The Intelligent Context Engine

**Turn raw research into platform-ready social content. In your voice. Without sounding like a bot.**

→ **[Try it live at ozigi.app](https://ozigi.app)**

![Ozigi Hero](https://ozigi.app/opengraph-image.png)


---

## What is Ozigi?

Ozigi is a content engine built for technical creators, founders, and builders who have real things to say — but treat writing posts as a tax on their actual work.

You drop in raw context. Ozigi returns polished, platform-specific drafts for X (Twitter), LinkedIn, and Discord. You edit the 10% only you know. You publish.

No prompt engineering. No reformatting for each platform. No AI slop.

---

## The Core Systems

### 1. Multimodal Ingestion
Drop in a URL, paste raw notes, or upload a PDF/image. Ozigi extracts the core narrative without requiring you to summarise it first. Powered by Gemini 2.5 Flash's massive context window.

### 2. The Banned Lexicon
Ozigi enforces a strict list of banned words at the API route level — not filtered after the fact, blocked at generation. No "delve", no "robust", no "seamlessly". The model is penalised for AI-speak, which forces output that reads like a professional wrote it.

### 3. System Personas
Instead of prompting "write a tweet about X", you define *who* the AI is. Personas are saved to a database and applied automatically to every campaign. One persona setup. Consistent voice across every post, forever.

### 4. Human-in-the-Loop (HITL)
Every generated campaign includes an Edit button. Ozigi handles the 90% — extraction, structure, constraints, platform formatting. You own the 10% — the specific detail, the insider context, the judgment call only a human can make. AI as co-pilot, not replacement.

### 5. Native Image Generation
Generate platform-aware graphics directly inside the engine. Blank field = abstract background. Add text = rendered text graphic. LinkedIn posts auto-attach images via a 3-step OAuth handshake on publish.

### 6. Publishing Integrations
- **X (Twitter):** Web Intents pop open a pre-loaded tweet tab for final review before posting
- **LinkedIn:** Direct OAuth publishing with image attachment
- **Discord:** Paste a webhook URL in Settings — campaigns drop straight into your chosen channel

### 7. Email Newsletters
Generate a single newsletter email that summarizes your 3‑day campaign. Write in your voice, include images, and schedule for later delivery. Manage your subscriber list from the dashboard and track sending limits.

### 8. Ozigi Copilot
A built‑in AI assistant that lives in your dashboard. Brainstorm ideas, refine drafts, and get tailored advice – all while keeping your context. Optionally search the web for up‑to‑date information.

### 9. Pricing & Gating
Free tier includes 5 campaigns/month. Team ($15/mo) unlocks 30 campaigns, image generation, email newsletter, and more. Organization ($39/mo) removes all limits and adds full Copilot access. Start with a 7‑day trial on the Team plan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js Route Handlers, Vercel Serverless |
| AI Engine | Google Cloud Vertex AI (Gemini 2.5 Flash) |
| Database & Auth | Supabase (PostgreSQL) |
| Testing | Playwright |

---

## Local Development

Requires Node.js v18+ and `pnpm`.

```bash
# Clone the repo
git clone https://github.com/Dumebii/OziGi.git
cd OziGi

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase and Google Cloud credentials

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_CLIENT_EMAIL=
GOOGLE_CLOUD_PRIVATE_KEY=
```

---

## Architecture

Curious how the Banned Lexicon works at the API level, or how the multimodal ingestion pipeline processes a PDF?

→ [Read the Architecture Deep Dives at ozigi.app/docs/deep-dives](https://ozigi.app/docs/deep-dives)

---

## Contributing

If you have ideas for new integrations (scheduling APIs, Dev.to publishing, Bluesky support), open an issue or submit a PR. The roadmap is public.
Ozigi was vibe-coded. Vibe-coded contributions are explicitly welcome — bring your instincts, run the tests, and ship the fix. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guidelines.

---

## Built by

**Dumebi Okolo** — Documentation Engineer & Builder  
[X / Twitter](https://x.com/DumebiTheWriter) · [LinkedIn](https://linkedin.com/in/dumebi-okolo) · [DEV.to](https://dev.to/dumebii)