# 🚀 Ozigi v3: The Content Engineer's Update (Changelog)

When v2 of Ozigi launched, the foundation was set: we had modular components, a Supabase backend, and automated Context History. But to truly classify as an "Agentic Content Engine," the application needed to move beyond the standard "chat wrapper" workflow and enforce rigorous, programmatic control over the LLM output.

With v3, we completely sunset the chat interface. We rebuilt Ozigi from the ground up to close the gap between raw technical research and structured social distribution. Docs as code? Meet content as code.

Here is a full breakdown of the architecture, the new features, and the engineering challenges we conquered in v3.

### 🧠 1. The Core Engine: AI Prompt Hierarchy & Lexicon Control

Agentic workflows require absolute precision. We overhauled how Ozigi communicates with Google’s Gemini 2.5 Pro (Vertex AI).

* **Solving "Lost in the Middle" Syndrome:** LLMs notoriously forget specific instructions placed in the middle of massive prompts. We engineered a strict prompt hierarchy inside our `/api/generate` route that extracts user directives (e.g., "End the final post with this exact sentence") and dynamically injects them at the absolute bottom of the payload, forcing flawless compliance.
* **The Banned Lexicon:** Technical writers are tired of cheesy AI buzzwords. The engine now programmatically suppresses a strict banned lexicon—say goodbye to words like *delve*, *robust*, *tapestry*, and *supercharge*.
* **Multi-Persona Architecture:** Users can now save and hot-swap between multiple custom voice profiles (e.g., "Snarky Developer" vs. "Corporate Educator") directly from the dashboard.

### ⚛️ 2. Frontend Architecture: The "Radio Tower" Pattern

In Next.js, prop-drilling state across deeply nested client components quickly becomes unmanageable.

* **Cross-Component Broadcasting:** To allow our nested Context Dropdown to trigger global UI modals without importing heavy state managers like Redux, we built a custom "Radio Tower" pattern using `window.dispatchEvent`. Components remain completely decoupled and single-responsibility.
* **Dynamic Loading & The Bento Grid:** We overhauled the UI to match the engine's technical weight. The landing page now features a modern 2x2 Bento Box grid, and the dashboard seamlessly swaps to a custom `<DynamicLoader />` during the AI generation cycle.
* **SEO & Metadata:** Implemented strict OpenGraph and Twitter Card metadata in the Next.js layout to ensure the app renders perfectly when shared across social channels.

### 🔐 3. Security & Database: Supabase RLS

As Ozigi prepares to push content directly to external APIs, managing OAuth tokens securely became our top priority.

* **Row Level Security (RLS):** Engineered strict Supabase RLS policies (`auth.uid() = user_id`) on the `user_tokens` table. This resolved permission bottlenecks and guarantees that users have isolated, cryptographic permission to manage their own social integration tokens.

### 👾 4. Omnichannel Distribution & Integrations

Ozigi doesn’t just format text; it stages it for immediate deployment.

* **X (Twitter) Web Intents:** We give users total control before publishing. Instead of a background API call, generating an X campaign instantly compiles the text and pops open a Twitter Web Intent tab, pre-loaded and ready for review.
* **Thread vs. Single Toggle:** The Context Engine now supports toggling X outputs between a single high-impact post or a fully numbered (1/5, etc.) technical thread.
* **Discord Webhook Integration:** Users can drop a Webhook URL into their Settings, allowing Ozigi to automatically pipe finalized campaign drafts directly into private Discord channels for team review.

### 📊 5. Product Ops: PostHog Analytics & Reverse Proxies

You cannot iterate on what you cannot measure.

* **Granular Event Tracking:** Integrated PostHog to track specific feature usage (like `campaign_generated`) so we can analyze which personas and formatting configurations are driving the most value.
* **Ad-Blocker Bypass:** Deployed a CNAME reverse proxy (`t.ozigi.app`) to route analytics traffic. This prevents aggressive ad-blockers from dropping events, ensuring near 100% accurate product data without compromising user privacy.

### 🧪 6. Quality Assurance: Playwright Network Interception

Testing non-deterministic AI models in a CI/CD pipeline is slow, expensive, and flaky.

* **Mocking the LLM:** We rebuilt our End-to-End (E2E) testing suite in Playwright. Instead of hitting the live Vertex AI endpoint and burning credits during tests, we use `page.route` to intercept the network request and instantly inject a mocked JSON payload. This validates our complex UI state transitions in milliseconds for exactly $0.

---

Ozigi v3 is officially live. If you are a pragmatic developer or technical writer looking to turn raw notes into structured campaigns without the prompt engineering headache, take the engine for a spin.

Try it out: [ozigi.app](https://ozigi.app)
Read the Docs: [ozigi.app/docs](https://www.google.com/search?q=https://ozigi.app/docs)
