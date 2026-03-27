import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Ozigi Docs — AI Content Engine for Technical Creators",
  description: "Learn how to turn raw notes, URLs, and PDFs into platform-ready social posts using Ozigi's context engine. Full documentation for personas, banned lexicon, image generation, and publishing.",
  alternates: { canonical: "https://ozigi.app/docs" },
};

export default function DocsPage() {
  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col scroll-smooth">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black italic uppercase tracking-tighter text-xl text-slate-900">
              Ozigi Docs
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm"
          >
            Go to Dashboard →
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col lg:flex-row gap-12 relative">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">On this page</h3>
            <nav>
              <ul className="space-y-3 text-sm font-medium text-slate-500">
                <li><a href="#getting-started" className="hover:text-slate-900 transition-colors block">1. Getting Started</a></li>
                <li><a href="#ingestion" className="hover:text-slate-900 transition-colors block">2. Multimodal Ingestion</a></li>
                <li><a href="#personas" className="hover:text-slate-900 transition-colors block">3. System Personas</a></li>
                <li><a href="#lexicon" className="hover:text-slate-900 transition-colors block">4. The Banned Lexicon</a></li>
                <li><a href="#generating" className="hover:text-slate-900 transition-colors block">5. Generating a Campaign</a></li>
                <li><a href="#human-in-the-loop" className="hover:text-slate-900 transition-colors block">6. Human‑in‑the‑Loop</a></li>
                <li><a href="#image-gen" className="hover:text-slate-900 transition-colors block">7. Native Image Generation</a></li>
                <li><a href="#publishing" className="hover:text-slate-900 transition-colors block">8. Publishing Integrations</a></li>
                <li><a href="#scheduling" className="hover:text-slate-900 transition-colors block">9. Scheduling & Reminders</a></li>
                <li><a href="#email" className="hover:text-slate-900 transition-colors block">10. Email Newsletters</a></li>
                <li><a href="#copilot" className="hover:text-slate-900 transition-colors block">11. Ozigi Copilot</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors block">12. Pricing & Gating</a></li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-3xl">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Platform Documentation
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Ozigi is an intelligent context engine that transforms your raw research—notes, URLs, PDFs—into structured social media campaigns for X, LinkedIn, Discord, Slack, and email. This guide covers everything you need to set up your workspace and start publishing content that sounds like you.
            </p>
          </div>

          <div className="space-y-20">
            {/* 1. Getting Started */}
            <section id="getting-started" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                1. Getting Started
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Before your first campaign, take five minutes to set up your workspace. Ozigi works best when it knows your voice and where you want to publish.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <span className="text-brand-red font-black text-xs uppercase tracking-widest block mb-2">Step 1</span>
                  <h4 className="font-bold text-slate-900 mb-2">Define Your Voice</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Create a System Persona—a database‑backed editorial brief. The more specific, the better. Tell the AI <em>who</em> it is, not what to write.</p>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <span className="text-brand-red font-black text-xs uppercase tracking-widest block mb-2">Step 2</span>
                  <h4 className="font-bold text-slate-900 mb-2">Connect Channels</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Add your Discord or Slack webhook in Settings. For X and LinkedIn, OAuth authentication is built in—just sign in once.</p>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <span className="text-brand-red font-black text-xs uppercase tracking-widest block mb-2">Step 3</span>
                  <h4 className="font-bold text-slate-900 mb-2">Advanced Settings</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Set your default tweet format (single/thread), and add campaign directives (e.g., “target junior engineers”) to fine‑tune output.</p>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <span className="text-brand-red font-black text-xs uppercase tracking-widest block mb-2">Step 4</span>
                  <h4 className="font-bold text-slate-900 mb-2">Choose Context</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Paste a URL, raw notes, or upload a file. Ozigi ingests text, PDFs, images, audio, and video—no need to summarize first.</p>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <span className="text-brand-red font-black text-xs uppercase tracking-widest block mb-2">Step 5</span>
                  <h4 className="font-bold text-slate-900 mb-2">Start a Campaign</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Click “Generate Campaign”. In seconds, you’ll have a multi‑day content plan with posts for each selected platform.</p>
                </div>
              </div>
            </section>

            {/* 2. Multimodal Ingestion */}
            <section id="ingestion" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                2. Multimodal Ingestion
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Ozigi’s engine is built on Google’s Gemini 2.5 Flash, which handles massive context windows. You don’t need to prompt‑engineer – just dump your raw material and let the engine extract the core narrative.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🔗</span>
                    <h3 className="font-black uppercase tracking-widest text-sm">URL Extraction</h3>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-500 mb-2">
                    https://dev.to/dumebii/ozigi-v2-changelog
                  </div>
                  <p className="text-xs text-slate-500 mt-2">The engine fetches and reads the page content, ignoring ads and navigation.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📝</span>
                    <h3 className="font-black uppercase tracking-widest text-sm">Raw Notes</h3>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 italic">
                    "Scaling automation requires treating test code like production code..."
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Unformatted meeting transcripts, brain dumps – keep them messy.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📁</span>
                    <h3 className="font-black uppercase tracking-widest text-sm">File Uploads</h3>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500">PDF, images, video, audio</div>
                  <p className="text-xs text-slate-500 mt-2">Upload up to 100MB per file. The AI reads text from images and transcribes audio.</p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/docs/multimodal-pipeline" className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-full text-sm font-bold hover:bg-indigo-100 transition-colors">
                  Read the Pipeline Deep Dive →
                </Link>
              </div>
            </section>

            {/* 3. System Personas */}
            <section id="personas" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                3. System Personas
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Personas are database‑backed voice profiles. Instead of rewriting prompts for every campaign, you save your editorial brief once and reuse it. Ozigi applies the persona’s constraints to every post.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <span className="text-red-700 font-black uppercase tracking-widest text-xs mb-2 block">❌ Weak Persona</span>
                  <p className="font-mono text-sm text-slate-700 leading-relaxed">"You are a helpful marketing assistant. Write engaging and professional posts about my software updates. Make sure to use emojis to make it fun."</p>
                  <p className="text-xs text-slate-600 mt-3">This tells the AI <em>what</em> to write, not <em>who</em> to be. It invites buzzwords.</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                  <span className="text-green-400 font-black uppercase tracking-widest text-xs mb-2 block">✅ High-Impact Persona</span>
                  <p className="font-mono text-sm text-slate-300 leading-relaxed">"You are a pragmatic, battle-tested Staff Engineer. You speak directly, use dry humor, and absolutely despise corporate fluff. You never apologize."</p>
                  <p className="text-xs text-slate-400 mt-3">This defines a character. The AI now has a voice to adopt.</p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/docs/system-personas" className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-full text-sm font-bold hover:bg-indigo-100 transition-colors">
                  Read the Persona Deep Dive →
                </Link>
              </div>
            </section>

            {/* 4. The Banned Lexicon */}
            <section id="lexicon" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                4. The Banned Lexicon
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Ozigi enforces a strict list of banned words at the API level. If the AI tries to use “delve”, “tapestry”, or “robust”, the request is penalized. This invisible guardrail forces the model to write like a real human.
              </p>
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap gap-2 justify-center mb-4">
                {["delve", "tapestry", "crucial", "landscape", "realm", "unlock", "supercharge", "robust", "seamlessly"].map(word => (
                  <span key={word} className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono line-through decoration-brand-red">
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-slate-600 font-medium leading-relaxed">The result? Copy that passes AI detectors and sounds like it came from a subject matter expert, not a language model.</p>
              <div className="mt-6">
                <Link href="/docs/the-banned-lexicon" className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-full text-sm font-bold hover:bg-indigo-100 transition-colors">
                  Read the Architecture Deep Dive →
                </Link>
              </div>
            </section>

            {/* 5. Generating a Campaign */}
            <section id="generating" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                5. Generating a Campaign
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                After selecting your persona and platforms, click “Generate Campaign”. The engine produces a 3‑day content plan, with separate posts for each platform. You’ll see an example like this:
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Day 1</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Day 2</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Day 3</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">X</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">LI</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">DC</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">SL</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2 rounded">Rate limits at edge</div>
                  <div className="bg-slate-50 p-2 rounded">Why edge matters</div>
                  <div className="bg-slate-50 p-2 rounded">Community update</div>
                  <div className="bg-slate-50 p-2 rounded">Slack announcement</div>
                </div>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed mt-4">
                Each post is a 90%‑ready draft. You’ll see an <strong>Edit</strong> button to add the final 10%—the specific details only you know.
              </p>
            </section>

            {/* 6. Human-in-the-Loop */}
            <section id="human-in-the-loop" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                6. Human-in-the-Loop (Editing)
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Ozigi is your co‑pilot, not your replacement. The engine handles extraction and structural drafting; you control the final polish.
              </p>
              <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1 text-sm text-indigo-800/80 font-medium leading-relaxed">
                  <p className="mb-2">Before: <span className="line-through text-slate-400">"We're thrilled to announce..."</span></p>
                  <p>After: <span className="font-bold">"Shipped rate limiting today. Hard cap at 1,000 req/min."</span></p>
                  <p className="text-xs mt-3">Click <strong>Edit</strong> on any card, tweak the content, and save. Your changes are preserved.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </div>
                  <span className="font-black italic uppercase text-slate-900 tracking-tighter">The "Edit" Factor</span>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/docs/human-in-the-loop" className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-full text-sm font-bold hover:bg-indigo-100 transition-colors">
                  Read the Architecture Deep Dive →
                </Link>
              </div>
            </section>

            {/* 7. Native Image Generation */}
            <section id="image-gen" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                7. Native Image Generation
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Every campaign card includes an image generator powered by Gemini 2.5 Flash. It creates platform‑aware graphics that you can download and attach to your posts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center text-xs text-slate-400">Abstract background</div>
                  <p className="text-xs font-medium text-slate-600">Leave the text field empty → generates a custom abstract graphic.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-white font-black text-sm">"3 Rules"</div>
                  <p className="text-xs font-medium text-slate-600 mt-3">Type a phrase → renders that text as a stylish title graphic.</p>
                </div>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed mt-4">Images are generated in 16:9 aspect ratio, perfect for social cards. They are stored in your R2 bucket and automatically linked when you publish to LinkedIn (via OAuth) or when you share the download link.</p>
            </section>

            {/* 8. Publishing Integrations */}
            <section id="publishing" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                8. Publishing Integrations
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Ozigi never posts without your final approval. Each platform uses a secure, one‑click method:
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="text-xl">𝕏</span>
                  <span className="text-xs font-bold">Web Intents</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="text-xl text-[#0A66C2]">in</span>
                  <span className="text-xs font-bold">Direct OAuth</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="text-xl text-[#5865F2]">👾</span>
                  <span className="text-xs font-bold">Webhook</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="text-xl">💬</span>
                  <span className="text-xs font-bold">Slack Webhook</span>
                </div>
              </div>
              <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl text-sm text-slate-600 font-mono">
                <p className="text-xs">• X: opens a pre‑filled tweet in a new tab – you review and post.</p>
                <p className="text-xs mt-2">• LinkedIn: OAuth popup – you authorise once; future posts go directly.</p>
                <p className="text-xs mt-2">• Discord / Slack: webhook URLs stored in your profile – posts go straight to your chosen channel.</p>
              </div>
              <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm">
  <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
    <Link href="/docs/webhooks" className="text-xs font-bold text-brand-red hover:underline">
See full webhook guide →
    </Link>  </h3>



</div>
            </section>

            {/* 9. Scheduling & Reminders */}
            <section id="scheduling" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                9. Scheduling & X Email Reminders
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                You don’t have to publish immediately. Click the <strong>Schedule</strong> icon on any campaign card, pick a date and time, and Ozigi will hold the post.
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold">When the scheduled time arrives:</p>
                  <ul className="text-xs text-slate-500 list-disc pl-4 mt-1">
                    <li>X posts: you receive an email with a direct link to the tweet intent.</li>
                    <li>LinkedIn, Discord, Slack: posts are published automatically (if you have the appropriate token/webhook).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 10. Email Newsletters */}
            <section id="email" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                10. Email Newsletters
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Ozigi can generate a standalone email newsletter that summarises your campaign. It’s perfect for reaching subscribers who prefer long‑form content.
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-700">
                  <p><strong>Subject:</strong> The hidden cost of CI flakiness</p>
                  <p className="mt-2">After 4 hours debugging a rate‑limit bug, I realized: we were checking limits at the wrong layer. Moved it to the edge. Now clients can burst 2x across the boundary.</p>
                </div>
                <p className="text-xs text-slate-500 mt-3">The newsletter is written in your persona’s voice and can be edited with the rich‑text editor before sending.</p>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                <strong>No email setup needed.</strong> Ozigi handles delivery using its own infrastructure (ZeptoMail / SMTP). You just manage your subscriber list from the dashboard – import CSV, add manually, and track unsubscribe.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
                <li>Subscribers stored in Supabase, with unique tokens for one‑click unsubscribe.</li>
                <li>Send limits per plan (500/mo for Team, unlimited for Organization).</li>
                <li>Rich‑text editor lets you add images, headings, and links before scheduling.</li>
              </ul>
            </section>

            {/* 11. Ozigi Copilot */}
            <section id="copilot" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                11. Ozigi Copilot
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Your personal AI assistant lives in the dashboard. Ask questions, brainstorm ideas, or refine drafts – the Copilot has access to your saved persona context and can optionally search the web.
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex justify-end">
                  <div className="bg-brand-red text-white rounded-2xl px-3 py-2 max-w-[80%] text-sm">How do I make my X thread more engaging?</div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 rounded-2xl px-3 py-2 max-w-[80%] text-sm">Start with a specific fact or number. Use sentence fragments. End each tweet with a hook that makes people want to read the next one.</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold">🔍 Web Search</span>
                  <span className="text-xs text-slate-400">Toggle on for real‑time information.</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 italic">Responses stream in real time. You can send any answer directly to the Context Engine to start a campaign.</div>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed mt-4">Copilot is available on the Organization plan. It uses your stored copilot context (set in Copilot Settings) to give tailored advice.</p>
            </section>

            {/* 12. Pricing & Gating */}
            <section id="pricing" className="scroll-mt-28">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
                12. Pricing & Gating
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">
                Ozigi offers tiered plans to match your volume. Every new user gets a <strong>7‑day trial of the Team plan</strong> – no credit card required.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-xl text-center">
                  <p className="font-black text-lg">Free</p>
                  <p className="text-xs text-slate-500">5 campaigns/month</p>
                  <ul className="mt-3 text-xs text-left text-slate-600 list-disc pl-4">
                    <li>1 saved persona</li>
                    <li>X, LinkedIn, Discord</li>
                  </ul>
                </div>
                <div className="bg-slate-900 text-white p-5 rounded-xl text-center relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[8px] px-2 py-0.5 rounded-full">Trial</span>
                  <p className="font-black text-lg">Team</p>
                  <p className="text-xs text-slate-300">$15/month or $144/year</p>
                  <ul className="mt-3 text-xs text-left text-slate-300 list-disc pl-4">
                    <li>30 campaigns/month</li>
                    <li>Unlimited personas</li>
                    <li>2 images/campaign</li>
                    <li>500 email sends/month</li>
                  </ul>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl text-center">
                  <p className="font-black text-lg">Organization</p>
                  <p className="text-xs text-slate-500">$39/month or $374.40/year</p>
                  <ul className="mt-3 text-xs text-left text-slate-600 list-disc pl-4">
                    <li>Unlimited campaigns & images</li>
                    <li>Unlimited email sends</li>
                    <li>Full Copilot with web search</li>
                    <li>Analytics</li>
                  </ul>
                </div>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed mt-4">
                Enterprise plans available – <a href="mailto:hello@ozigi.app" className="text-brand-red underline">contact us</a> for custom quotas, SLA, and team management.
              </p>
            </section>
          </div>

          {/* Deep Dives CTA */}
          <div className="mt-20 border-t-2 border-slate-100 pt-16">
            <div className="bg-slate-900 rounded-3xl p-10 text-center">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
                Master the Engine
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed mb-8 max-w-xl mx-auto">
                Ready to go under the hood? Read our architectural deep dives to understand exactly how Ozigi processes, constrains, and generates professional copy.
              </p>
              <Link
                href="/docs/deep-dives"
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl"
              >
                View All Deep Dives →
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}