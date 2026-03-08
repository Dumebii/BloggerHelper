import Link from "next/link";
import Footer from "../../components/Footer"; // Adjust path if your Footer is somewhere else!

export default function DocsPage() {
  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
      {/* Minimal Docs Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black italic uppercase tracking-tighter text-xl text-slate-900">
              Ozigi Docs
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-700 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>
      </header>

      {/* Docs Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Platform Documentation
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Ozigi is an agentic content engine designed to bridge the gap
            between your raw research and structured social distribution. Here
            is how to wire it up.
          </p>
        </div>

        <div className="space-y-16">
          {/* Section 1: The Context Engine */}
          <section>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
              1. The Context Engine
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-4">
              Unlike standard AI chatbots, Ozigi does not require prompt
              engineering on your end. You simply provide the context, and the
              engine handles the stylistic constraints.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium mb-6">
              <li>
                <strong>URL Ingestion:</strong> Paste a link to your blog post
                or documentation.
              </li>
              <li>
                <strong>Raw Notes:</strong> Dump unformatted meeting transcripts
                or thought dumps.
              </li>
              <li>
                <strong>Directives:</strong> Use the "Additional Directives"
                field to pass strict rules (e.g., "End the final post with a
                link to my newsletter").
              </li>
            </ul>
          </section>

          {/* Section 2: Custom Personas */}
          <section>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
              2. Custom Personas
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-4">
              You can save multiple voice profiles in your Settings modal. When
              writing your persona prompt, focus on <strong>who</strong> you
              are, not what you are writing.
            </p>
            <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl text-sm font-mono leading-relaxed shadow-lg">
              <span className="text-red-400 font-bold mb-2 block">
                // Good Persona Example
              </span>
              "You are a pragmatic, battle-tested software engineer. You speak
              directly, use dry humor, and hate corporate buzzwords. You prefer
              short, punchy sentences."
            </div>
          </section>

          {/* Section 3: Publishing Integrations */}
          <section>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
              3. Publishing & Formatting
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-6">
              Ozigi does not post to your accounts without your final say. We
              use a combination of secure OAuth and Web Intents to give you
              total control over the final published product.
            </p>

            <div className="space-y-8">
              {/* X / Twitter Sub-section */}
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-slate-900 text-2xl">𝕏</span> X (Twitter)
                  Web Intents
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-4 text-sm">
                  To ensure you can review character limits and add media, Ozigi
                  uses <strong>Twitter Web Intents</strong>. When you click
                  "Publish" for an X post, we don't use a background API.
                  Instead, we instantly compile your generated text and pop open
                  a new Twitter tab with your content pre-loaded and ready to
                  tweet.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2">
                    Threads vs. Singles
                  </h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Inside the Context Engine, you can toggle your X output
                    between a <strong>Single Tweet</strong> or a full{" "}
                    <strong>Thread</strong>. Ozigi's AI is explicitly trained to
                    architect technical threads with proper numbering (1/5,
                    etc.) and line breaks.
                  </p>
                </div>
              </div>

              {/* Discord Sub-section */}
              <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm mt-8">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-[#5865F2] text-2xl">👾</span> Discord
                  Webhook Setup
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm">
                  To let Ozigi automatically drop campaign drafts into your
                  Discord, you just need a Webhook URL. It takes exactly 15
                  seconds to create one:
                </p>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-700 font-medium font-sans">
                  <li>
                    Open your Discord server and click your{" "}
                    <strong>Server Name</strong> in the top left corner.
                  </li>
                  <li>
                    Select <strong>Server Settings</strong> from the dropdown
                    menu.
                  </li>
                  <li>
                    In the left sidebar, click on <strong>Integrations</strong>,
                    then click <strong>Webhooks</strong>.
                  </li>
                  <li>
                    Click the <strong>New Webhook</strong> button.
                  </li>
                  <li>
                    Give your webhook a name (like "Ozigi Bot") and select the
                    specific channel where you want your posts to land.
                  </li>
                  <li>
                    Click <strong>Copy Webhook URL</strong> and hit Save.
                  </li>
                  <li>
                    Paste that URL directly into your Ozigi Settings modal.
                    You're done! 🚀
                  </li>
                </ol>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
