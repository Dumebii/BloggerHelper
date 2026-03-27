import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "How to Create Discord & Slack Webhooks | Ozigi Docs",
  description: "Step-by-step guide to setting up incoming webhooks for Discord and Slack to publish content directly from Ozigi.",
  alternates: { canonical: "https://ozigi.app/docs/webhooks" },
};

export default function WebhooksGuide() {
  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-8">
          <Link href="/docs" className="flex items-center gap-2 group">
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <div className="mb-12">
          <Link href="/docs" className="text-sm text-brand-red hover:underline inline-flex items-center gap-1">
            ← Back to Docs
          </Link>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mt-4 mb-6">
            Creating Webhooks for Discord & Slack
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            To send posts from Ozigi to Discord or Slack, you need a webhook URL. Follow these steps to generate one.
          </p>
        </div>

        <div className="space-y-16">
          {/* Discord section */}
          <section>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
              Discord Webhooks
            </h2>
            <div className="space-y-6">
              <p className="text-slate-600 font-medium">
                Discord webhooks are the easiest way to send automated messages to a text channel. Here’s how to create one:
              </p>
              <ol className="list-decimal pl-6 space-y-4 text-slate-600 font-medium">
                <li>
                  <strong>Open your Discord server</strong> – click on the server name at the top left and select <strong>Server Settings</strong>.
                </li>
                <li>
                  In the left menu, click <strong>Integrations</strong> → <strong>Webhooks</strong>.
                </li>
                <li>
                  Click <strong>New Webhook</strong>. Give it a name (e.g., “Ozigi Bot”) and choose the channel where you want the posts to appear.
                </li>
                <li>
                  Click <strong>Copy Webhook URL</strong>. The URL looks like:
                  <pre className="bg-slate-100 p-3 rounded-xl text-xs font-mono mt-2 overflow-x-auto">
                    https://discord.com/api/webhooks/1234567890/abcdefghijklmnop
                  </pre>
                </li>
                <li>
                  Paste this URL into the <strong>Discord Webhook URL</strong> field in your Ozigi Settings.
                </li>
              </ol>
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">💡 Tip</p>
                <p className="text-sm text-blue-700 mt-1">You can create multiple webhooks for different channels, but Ozigi only uses one at a time. Choose the channel you want to be your primary destination.</p>
              </div>
            </div>
          </section>

          {/* Slack section */}
          <section>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
              Slack Webhooks
            </h2>
            <div className="space-y-6">
              <p className="text-slate-600 font-medium">
                Slack uses incoming webhooks to post messages from external apps. You need to create a Slack app first.
              </p>
              <ol className="list-decimal pl-6 space-y-4 text-slate-600 font-medium">
                <li>
                  Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-brand-red underline">api.slack.com/apps</a> and click <strong>Create New App</strong>.
                </li>
                <li>
                  Choose <strong>From scratch</strong>, give your app a name (e.g., “Ozigi”), and select your workspace.
                </li>
                <li>
                  In the left sidebar, click <strong>Incoming Webhooks</strong> and toggle the switch to <strong>Activate Incoming Webhooks</strong>.
                </li>
                <li>
                  Scroll down and click <strong>Add New Webhook to Workspace</strong>. Select the channel where you want messages to appear and click <strong>Allow</strong>.
                </li>
                <li>
                  Copy the generated webhook URL – it will look like:
                  <pre className="bg-slate-100 p-3 rounded-xl text-xs font-mono mt-2 overflow-x-auto">
                    https://hooks.slack.com/services/...
                  </pre>
                </li>
                <li>
                  Paste this URL into the <strong>Slack Webhook URL</strong> field in your Ozigi Settings.
                </li>
              </ol>
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-blue-800">📌 Important</p>
                <p className="text-sm text-blue-700 mt-1">You need permission to install apps in your workspace. If you’re not an admin, ask your workspace admin to create the app and give you the webhook URL.</p>
              </div>
            </div>
          </section>

          {/* Testing */}
          <section>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">
              Testing Your Webhook
            </h2>
            <p className="text-slate-600 font-medium">
              After saving the URL in Ozigi, generate a campaign and click the <strong>Post to Discord</strong> or <strong>Send to Slack</strong> button. You should see the message appear in the channel you selected.
            </p>
            <p className="text-slate-600 font-medium mt-4">
              If it doesn’t work, double‑check the URL (it should start with <code className="bg-slate-100 px-1">https://discord.com/api/webhooks/</code> or <code className="bg-slate-100 px-1">https://hooks.slack.com/services/</code>) and ensure the app is still active.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}