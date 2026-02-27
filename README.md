Congratulations on the launch! Moving from a functional prototype to a public-facing repository is the final step in establishing that "AI Architect" authority. A great README doesn't just explain *what* the code does; it explains the **Technical Logic** and the **Value Proposition**.

Since we are positioning this as an **Agentic Content Engine**, the README needs to look like a professional internal tool.

---

## The Ultimate README.md for your Agentic Scheduler

```markdown
# 🛰️ Agentic Content Engine (v1)
### Transforming Technical Articles into Multi-Day Social Campaigns with Gemini 3.1 Pro

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Gemini](https://img.shields.io/badge/AI-Gemini%203.1%20Pro-orange)

The **Agentic Content Engine** is a semi-autonomous internal tool designed for technical writers and developers. It slashes the "distribution tax" by ingesting long-form content (via dev.to API) and architecting a structured, 3-day social media blitz across X, LinkedIn, and Discord.

## 🚀 The "4-Hour" Workflow Slash
Traditionally, re-formatting a technical deep-dive for three different platforms takes hours of manual context-switching. This tool automates the **Reasoning Tier**, providing platform-specific hooks and deep-dives while keeping the human in the loop for the final deployment.

---

## 🛠️ Technical Architecture

The system is built on a **Three-Tier Agentic Workflow**:

1. **Ingestion Layer:** Connects to the Forem API to fetch raw Markdown, ensuring the AI has the full technical context of the original research.
2. **Reasoning Layer (Gemini 3.1 Pro):** Uses high-level reasoning to perform "Thematic Decomposition." It maps the article into:
   - **Day 1 (The Hook):** High-engagement X threads.
   - **Day 2 (The Deep-Dive):** Professional LinkedIn insights.
   - **Day 3 (The Lessons):** Community-focused Discord updates.
3. **Execution Layer:** A React-based Kanban board with a server-side pipeline to Discord Webhooks for one-click deployment.



---

## ✨ Key Features

- **Smart Truncation:** Automatic 250-character capping for social cards to ensure scannability.
- **Strict Schema Enforcement:** Robust JSON sanitization to prevent LLM "chatty" hallucinations from breaking the UI.
- **Kanban Strategy Board:** A platform-first view of your distribution timeline.
- **One-Click Discord Deploy:** Direct integration with Discord Webhooks.

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/agentic-scheduler.git](https://github.com/your-username/agentic-scheduler.git)
cd agentic-scheduler

```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following:

```text
# REQUIRED: Google Gemini API Key (Note: Must be named exactly as below for SDK compatibility)
GOOGLE_API_KEY=your_gemini_api_key_here

# OPTIONAL: Discord Webhook for auto-posting
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

```

### 4. Run the development server

```bash
npm run dev

```

---

## 🚧 Roadmap (v2 & Beyond)

This project is currently in **v1 (MVP)**. Future iterations will include:

* [ ] **OAuth 2.0 Integration:** Native posting for X (Twitter) and LinkedIn.
* [ ] **Semantic Link Injection:** Dynamically weaving the source URL into the AI-generated narrative.
* [ ] **Voice Fine-Tuning:** Custom personas to match specific brand tones.

---

## 🤝 Contributing

This tool was built to solve a personal bottleneck. If you're an engineer looking to improve the agentic logic or UI, feel free to fork the repo and submit a PR!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with 💡 by [Okolo Dumebi**](https://dev.to/dumebii)

```


**Would you like me to help you draft a "Project Story" for your GitHub profile README to link this all together?**

```
