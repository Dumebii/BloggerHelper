# Ozigi: The Intelligent Context Engine ⚡

## Table of Contents

- Overview
- Core Problem it Solves
- Key Features
- Tech Stack & Architecture
- Local Development Setup
- Project Structure
- Contributing
- License

Ozigi is a universal context engine designed to cure "blank page syndrome" for technical writers, founders, and content creators. 

Instead of relying on generic prompt engineering, Ozigi ingests raw, unformatted context (PDFs, scraped URLs, meeting transcripts, or rough notes) and architects a structured, multi-platform social media distribution strategy in a strictly constrained, authentic human voice.

![Ozigi Hero](https://ozigi.app/opengraph-image.png)

## 🚀 The Core Problem it Solves
Generative AI often produces content that sounds robotic, relies heavily on predictable lexicons (e.g., "delve", "robust", "tapestry"), and ignores the user's actual technical context. Ozigi solves this by wrapping an enterprise-grade LLM in strict stylistic constraints and persona-based routing, ensuring the output is highly bursty, pragmatic, and ready for immediate distribution.

## ✨ Key Features
- **Multimodal Context Ingestion:** Drop in a URL, paste unformatted text, or upload a PDF/Image. Ozigi extracts the core narrative without requiring pre-summarization.
- **Voice Personas (Database-Backed):** Users can create and save custom voice profiles. The engine dynamically maps the selected persona to the prompt, guaranteeing stylistic consistency across campaigns.
- **Banned Lexicon & Anti-Detection:** The API enforces strict negative constraints, actively forbidding the use of cheesy AI buzzwords and restricting emoji/hashtag formatting.
- **Omnichannel Routing:** A single generation yields distinct, platform-optimized outputs for X (Twitter) threads, LinkedIn posts, and Discord markdown announcements.
- **Perceived Performance UI:** Features a custom, determinate loading sequence that builds psychological suspense, masking the standard 15-second LLM generation wait time.

## 🛠 Tech Stack & Architecture
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend/API:** Next.js Route Handlers, Vercel Edge/Serverless Functions
- **AI Engine:** Google Cloud Vertex AI (Gemini 2.5 Pro)
- **Database & Auth:** Supabase (PostgreSQL)
- **Testing:** Playwright

## 💻 Local Development Setup

To run Ozigi locally, you will need Node.js (v18+) and `pnpm` installed.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Dumebii/OziGi.git](https://github.com/Dumebii/OziGi.git)
   cd OziGi
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
   GOOGLE_CLOUD_CLIENT_EMAIL=your_gcp_client_email
   GOOGLE_CLOUD_PRIVATE_KEY="your_gcp_private_key"
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 Philosophy & Contribution
Ozigi was built to optimize the technical content lifecycle. It prioritizes workflow automation and developer experience (DevEx) over complex prompt engineering. If you have suggestions for new integrations (e.g., scheduling APIs or Dev.to publishing), feel free to open an issue or submit a pull request!

## License

This project is licensed under the MIT License.
See the LICENSE file for details.
