# ⚡ Ozigi — AI Content That Sounds Human

**Turn raw notes, links, and PDFs into platform-ready social posts that sound like you wrote them — not like you prompted a chatbot.**

→ **[Try it live at ozigi.app](https://ozigi.app)**

![Ozigi Hero](https://ozigi.app/opengraph-image.png)



---

## What is Ozigi?

Ozigi is the AI that makes your content sound like *you* — not like a language model running on average. It's built for technical creators, founders, and builders who have real things to say but find that every AI writing tool strips out the specificity, voice, and credibility that makes content worth reading.

You drop in raw context — a URL, a block of notes, a PDF, an image. Ozigi returns polished, platform-specific drafts for X (Twitter), LinkedIn, Discord, Slack, and email. You edit the 10% only you know. You publish.

The output doesn't sound like it came from ChatGPT. It doesn't open with "In today's fast-paced landscape." It doesn't use "delve" or "robust" or "seamlessly." It sounds like a person who actually built the thing and knows how to explain it.

No prompt engineering. No reformatting for each platform. No AI slop.

---

## The Core Systems

### 1. Multimodal Ingestion
Drop in a URL, paste raw notes, or upload a PDF/image. Ozigi extracts the core narrative without requiring you to summarise it first. Powered by Gemini 2.5 Flash's massive context window.

### 2. The Banned Lexicon
The single most important reason Ozigi doesn't sound like AI. A hard-coded blocklist enforced at the API route level — not filtered after generation, blocked *during* it. No "delve", no "robust", no "seamlessly", no "tapestry". The model is penalised for AI-speak vocabulary, which forces every sentence to be constructed from your actual content instead of padded with filler. The output reads like a professional wrote it, because the filler that makes AI sound like AI has been surgically removed.

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

### 9. Blog Post Generation
Generate comprehensive blog posts, tutorials, and technical documentation. Available for Organization and Enterprise tiers. Choose tone, structure, and length – get MDX-ready output with proper headings, code blocks, and formatting.

### 10. Persona Marketplace
Choose from 14 pre-built personas — technical and non-technical — each with a fully structured voice brief covering identity, origin, beliefs, tone, and key messages. Battle-Tested Engineer, DevRel Champion, Technical Founder, Brand & Marketing Manager, Career Coach, and more. Each persona produces meaningfully different output that sounds like a specific type of person, not a generic AI.

### 11. Subscription Management
Full subscription lifecycle support including plan upgrades with tailored welcome emails, and self-service cancellation with reason tracking for compliance.

### 12. GitHub Context (via Composio)
Connect your GitHub account once in Settings → Integrations. On every campaign generation and every Copilot conversation, Ozigi pulls context from your 3 most recently active repositories via the GitHub API and includes it silently in the generation prompt. The result: your posts naturally reference what you actually built — repo names, what the project does, recent commits, and your latest release notes.

What Ozigi reads per repo:
- Repository name and description
- README (project overview, stripped of code blocks and markdown)
- Last 5 commit messages
- Latest release name and notes (if you publish GitHub releases)

Ozigi reads **public repository metadata only** — never source code, private repos, or secrets. The OAuth token is managed entirely by Composio; Ozigi stores only a connection reference ID.

### 13. Pricing & Gating
Free tier includes 5 campaigns/month. Team ($15/mo) unlocks 30 campaigns, image generation, email newsletter, blog distribution, and more. Organization ($39/mo) removes all limits, adds full Copilot access, and enables blog post generation. Start with a 7‑day trial on the Team plan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js Route Handlers, Vercel Serverless |
| AI Engine | Google Cloud Vertex AI (Gemini 2.5 Flash) |
| Database & Auth | Supabase (PostgreSQL) |
| Rate Limiting & Scheduling | Upstash Redis + QStash |
| Integrations | Composio (GitHub OAuth) |
| Email | ZeptoMail |
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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_CLIENT_EMAIL=
GOOGLE_CLOUD_PRIVATE_KEY=

# Upstash — rate limiting (Redis) + scheduled posts (QStash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Composio — GitHub OAuth context
COMPOSIO_API_KEY=
COMPOSIO_GITHUB_AUTH_CONFIG_ID=
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
