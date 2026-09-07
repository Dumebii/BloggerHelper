import type { SupabaseClient } from "@supabase/supabase-js";

// Twice-a-week evergreen broadcast to ALL users about what Ozigi can do.
// No discounts, no lapsed-user framing — safe to loop indefinitely.
//
// Cadence: the daily promo cron (/api/cron/promotional) sends the single
// earliest due pending row, so dating campaigns on two weekdays yields two
// sends/week. Broadcast rows are tagged template='broadcast' so the auto-loop
// refill can find them without touching one-off announcements/surveys/drips.

const APP_URL = process.env.APP_URL || "https://ozigi.app";

// 0=Sun … 1=Mon, 4=Thu. Mon & Thu so a Monday start lands on a send day.
export const SEND_DAYS = [1, 4];
export const SEND_HOUR_UTC = 10;

// Keep at least this many future sends staged; when fewer remain, top up to TARGET.
export const REFILL_THRESHOLD = 4;
export const REFILL_TARGET = 8;

export const BROADCAST_TEMPLATE = "broadcast";

const dashboardUrl = `${APP_URL}/dashboard`;
const gtmUrl = `${APP_URL}/dashboard/gtm`;
const EXTENSION_STORE_URL =
  "https://chromewebstore.google.com/detail/ozigi-for-linkedin/kilioffojdajfheabhckfnpinobhjnoa";

export interface BroadcastCampaign {
  subject: string;
  headline: string;
  body_content: string;
  cta_text: string;
  cta_url: string;
}

// Ordered so consecutive sends alternate between the content engine and the
// GTM engine rather than running four outbound emails in a row. At two sends a
// week the full rotation takes ~7 weeks before a subscriber sees a repeat.
export const BROADCAST_CAMPAIGNS: BroadcastCampaign[] = [
  {
    subject: "Turn one link into a week of content",
    headline: "Paste a link. Walk away with a campaign.",
    body_content: `
      <p style="margin:0 0 16px 0;">Here's the fastest thing you can do in Ozigi today: drop in a URL — a blog post, a launch page, a YouTube video — and get a full set of ready-to-post content back in about a minute.</p>
      <p style="margin:0 0 16px 0;">You don't start from a blank page. Ozigi reads your source, pulls out what matters, and writes posts that sound like a person wrote them — no "dive deep," no "in today's fast-paced world."</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Got a link handy? This is a 60-second win.</p>
    `,
    cta_text: "Generate from a link",
    cta_url: dashboardUrl,
  },
  {
    subject: "LinkedIn outreach that runs in your own browser",
    headline: "The Ozigi extension is on the Chrome Web Store",
    body_content: `
      <p style="margin:0 0 16px 0;">LinkedIn quietly breaks server-side automation. It withholds search results and hides the Connect button from flagged sessions, so the tool looks like it is working while nothing actually goes out.</p>
      <p style="margin:0 0 16px 0;"><strong style="color:#0f172a;">Ozigi for LinkedIn</strong> sidesteps that. It runs as a Chrome extension inside your own logged-in tab: it finds people matching your ICP, and sends connection requests with a note written from that person's real profile — at human pace, under a daily cap you set yourself.</p>
      <p style="margin:0 0 16px 0;">No password to hand over, no headless browser on a server somewhere. Install it, paste your connection token, switch it on.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Connection requests with a personalised note — Ozigi does not send LinkedIn DMs.</p>
    `,
    cta_text: "Install the extension",
    cta_url: EXTENSION_STORE_URL,
  },
  {
    subject: "Write it once, post it everywhere",
    headline: "One source. Every platform. No copy-paste.",
    body_content: `
      <p style="margin:0 0 16px 0;">Reformatting the same update for X, LinkedIn, Discord, and Slack by hand is busywork. Ozigi writes a native version for each — a punchy thread for X, a professional take for LinkedIn, a casual drop for Discord — all from the same source.</p>
      <p style="margin:0 0 16px 0;">Pick the platforms you want, generate, edit anything you like, and publish or schedule. That's the whole loop.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Supports X · LinkedIn · Discord · Slack · Email newsletter.</p>
    `,
    cta_text: "Create a multi-platform campaign",
    cta_url: dashboardUrl,
  },
  {
    subject: "Your leads, in a CSV, whenever you want them",
    headline: "Export is live — the data is yours",
    body_content: `
      <p style="margin:0 0 16px 0;">Leads used to live only inside the Ozigi table. Now every campaign has an <strong style="color:#0f172a;">Export CSV</strong> button, sitting right next to Import.</p>
      <p style="margin:0 0 16px 0;">You get the whole record, not a preview: name, email, company, location, source, LinkedIn URL, X handle, GitHub username, bio, tags, ICP score, status, and date added — for every lead in the campaign, not just the first page.</p>
      <p style="margin:0 0 16px 0;">Take it into your CRM, a spreadsheet, Zapier, or a sales tool you already pay for. Nothing is locked in.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Open a campaign, hit Export CSV. That's the whole thing.</p>
    `,
    cta_text: "Export your leads",
    cta_url: gtmUrl,
  },
  {
    subject: "Your brand voice, saved once and reused forever",
    headline: "One voice, across content and outreach",
    body_content: `
      <p style="margin:0 0 16px 0;">Personas are where you tell Ozigi who is writing — role, tone, beliefs, the things you would never say. Save it once and every campaign, every outreach step, and every long-form draft after that sounds unmistakably like you.</p>
      <p style="margin:0 0 16px 0;">Running content for clients? Save a separate persona for each one and switch between them in a click.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Browse the Persona Marketplace for ready-made voices, or build your own in a few minutes.</p>
    `,
    cta_text: "Browse the marketplace",
    cta_url: `${APP_URL}/dashboard/personas/marketplace`,
  },
  {
    subject: "Where your next 200 leads come from",
    headline: "Five sources, one ICP, scored before they reach you",
    body_content: `
      <p style="margin:0 0 16px 0;">Describe who you are after once. Ozigi sources matching people from <strong style="color:#0f172a;">GitHub, Dev.to, npm, Hacker News, and LinkedIn</strong> — where technical buyers actually are, not a stale database someone resold.</p>
      <p style="margin:0 0 16px 0;">When a GitHub profile hides its email, Ozigi recovers a real address from that person's public commit history. Then every lead is scored 0.0–1.0 against your ICP, and only the ones above your threshold enter a sequence.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Clean lists in, better replies out — without you filtering by hand.</p>
    `,
    cta_text: "Set up your ICP",
    cta_url: gtmUrl,
  },
  {
    subject: "Never write a newsletter from scratch again",
    headline: "A newsletter your subscribers actually read",
    body_content: `
      <p style="margin:0 0 16px 0;">Ozigi turns your campaign into a standalone newsletter — not a recap of your posts, but a real piece written in your voice — and sends it to your subscriber list from the same dashboard.</p>
      <p style="margin:0 0 16px 0;">No second tool, no exporting, no wrestling with a separate email platform. Generate, review in the editor, and send.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">You can manage your subscribers right inside Ozigi too.</p>
    `,
    cta_text: "Write a newsletter",
    cta_url: dashboardUrl,
  },
  {
    subject: "Leads should land where your team already works",
    headline: "Ozigi talks to your CRM",
    body_content: `
      <p style="margin:0 0 16px 0;">Outreach that lives in a silo creates a second pipeline nobody trusts. Ozigi pushes each lead into your CRM on first contact, so the record exists before anyone has to ask where it came from.</p>
      <p style="margin:0 0 16px 0;">HubSpot, Zoho, and Salesforce connect over OAuth — click through once, no API keys to paste. Swipe One connects with a key.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Set it up under Outreach Settings → Integrations.</p>
    `,
    cta_text: "Connect your CRM",
    cta_url: `${APP_URL}/dashboard/gtm/settings`,
  },
  {
    subject: "Why Ozigi content doesn't read as AI",
    headline: "The Banned Lexicon",
    body_content: `
      <p style="margin:0 0 16px 0;">Most AI writing gives itself away in the vocabulary. "Delve." "Robust." "Seamlessly." "Tapestry." "Game-changing." Readers clock it in one line, and spam filters clock it too.</p>
      <p style="margin:0 0 16px 0;">Ozigi enforces a hard blocklist at the API route level. The words are not filtered out afterwards — they are blocked <em>during</em> generation, so the model is penalised for reaching for AI-speak and has to build every sentence out of your actual material instead.</p>
      <p style="margin:0 0 16px 0;">The same list applies everywhere: cold email, blog posts, LinkedIn, newsletters. One standard, every channel.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Curious how it works? The full write-up is in the docs.</p>
    `,
    cta_text: "Read the deep dive",
    cta_url: `${APP_URL}/docs/the-banned-lexicon`,
  },
  {
    subject: "Schedule a week of posts in ten minutes",
    headline: "Batch it once. Publish all week.",
    body_content: `
      <p style="margin:0 0 16px 0;">You don't have to post in real time. Generate your content, set a date and time for each piece, and Ozigi handles the publishing.</p>
      <p style="margin:0 0 16px 0;">For platforms that need a human tap, you'll get an email reminder at the scheduled time with a one-click link that opens the composer pre-filled — so nothing slips.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Everything you've scheduled lives in one place under Scheduled Posts.</p>
    `,
    cta_text: "Schedule your posts",
    cta_url: dashboardUrl,
  },
  {
    subject: "Fill your pipeline while your content runs",
    headline: "Cold outreach, built into the same tool",
    body_content: `
      <p style="margin:0 0 16px 0;">Ozigi isn't only content. It also finds leads that match your ideal customer, scores them, and runs multi-step email and LinkedIn sequences written from each lead's real profile — not generic blasts.</p>
      <p style="margin:0 0 16px 0;">Connect your email, describe who you're targeting, and set the delays between steps. Per-channel daily limits protect your domain reputation and your LinkedIn standing, and replies come straight back to your own inbox.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Content keeps you visible. Outreach starts the conversations.</p>
    `,
    cta_text: "Explore outreach",
    cta_url: gtmUrl,
  },
  {
    subject: "A PDF, a screenshot, a page of rough notes",
    headline: "Your source doesn't have to be a link",
    body_content: `
      <p style="margin:0 0 16px 0;">Not every idea arrives as a tidy URL. Ozigi also takes a PDF, an image, a YouTube video, or a block of raw unedited notes, and pulls the actual narrative out of it.</p>
      <p style="margin:0 0 16px 0;">Conference slides become a LinkedIn post. A whiteboard photo becomes a thread. Half-finished notes from a customer call become a newsletter.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">The messier the input, the more this one earns its keep.</p>
    `,
    cta_text: "Upload a source",
    cta_url: dashboardUrl,
  },
  {
    subject: "Every long-form draft gets audited before you see it",
    headline: "Long-form, with a structural audit attached",
    body_content: `
      <p style="margin:0 0 16px 0;">Ozigi writes full blog posts, tutorials, and technical docs from a topic, an outline, or material you already have. Pick who the piece is for and it calibrates the jargon, the code, and how claims get evidenced.</p>
      <p style="margin:0 0 16px 0;">Then seventeen detectors run over the draft and score it out of 100 — catching the AI cadence a word list can't reach: thirty paragraphs of identical length, four sentences opening the same way, the same point made in three places.</p>
      <p style="margin:0 0 16px 0;">It also reads every code block for leaked credentials and for smart quotes — invisible on the page, and a syntax error the second a reader pastes your snippet.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">About 10ms on a 2,500-word article, with no second model call.</p>
    `,
    cta_text: "Write a blog post",
    cta_url: `${APP_URL}/dashboard/long-form`,
  },
  {
    subject: "Add the visuals without opening a design tool",
    headline: "Images and a copilot, right where you write",
    body_content: `
      <p style="margin:0 0 16px 0;">Two things that make your posts land harder, both built in:</p>
      <p style="margin:0 0 16px 0;"><strong style="color:#0f172a;">AI images</strong> — describe the visual you want and get a polished graphic to attach to your post. Leave the field blank for an abstract background matched to the topic, or add a title for a clean text graphic.</p>
      <p style="margin:0 0 16px 0;"><strong style="color:#0f172a;">The Copilot</strong> — stuck on an angle? It knows your current campaign and your personas, can pull in live web context, and sends the result straight into the generator.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Small features, big difference in how finished your content feels.</p>
    `,
    cta_text: "Try it now",
    cta_url: dashboardUrl,
  },
  {
    subject: "Free tools you don't need an account for",
    headline: "Borrow the engine, no signup",
    body_content: `
      <p style="margin:0 0 16px 0;">A few pieces of Ozigi are just open on the site — useful on their own, and a fair way to judge the writing before you commit anything to it:</p>
      <p style="margin:0 0 16px 0;"><strong style="color:#0f172a;">The AI Slop Checker</strong> — paste any draft and see which lines read as machine-written, and why.</p>
      <p style="margin:0 0 16px 0;">Alongside it: standalone generators for cold email, LinkedIn messages, newsletters, and long-form articles.</p>
      <p style="margin:0;color:#64748b;font-size:14px;">Worth sending to a teammate who hasn't signed up yet.</p>
    `,
    cta_text: "Try the Slop Checker",
    cta_url: `${APP_URL}/slop-checker`,
  },
];

/**
 * Returns the next `count` send slots (SEND_DAYS at SEND_HOUR_UTC).
 * When `includeFromDay` is true and `from` falls on a send day, the first slot
 * is that day at SEND_HOUR_UTC even if the hour has already passed — so a
 * same-day start is possible (the row is due immediately and goes out on the
 * next cron fire).
 */
export function nextSendSlots(from: Date, count: number, includeFromDay = false): string[] {
  const slots: string[] = [];
  const cursor = new Date(from);
  cursor.setUTCHours(SEND_HOUR_UTC, 0, 0, 0);

  if (!includeFromDay && cursor <= from) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    cursor.setUTCHours(SEND_HOUR_UTC, 0, 0, 0);
  }

  while (slots.length < count) {
    if (SEND_DAYS.includes(cursor.getUTCDay())) {
      slots.push(new Date(cursor).toISOString());
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    cursor.setUTCHours(SEND_HOUR_UTC, 0, 0, 0);
  }
  return slots;
}

export interface BroadcastRow extends BroadcastCampaign {
  scheduled_for: string;
  status: "pending";
  template: string;
}

/**
 * Builds `count` queue rows starting at `from`, cycling through the evergreen
 * campaigns (offset by `rotationOffset` so a refill continues the loop rather
 * than restarting at the first email).
 */
export function buildBroadcastRows(
  from: Date,
  count: number,
  rotationOffset = 0,
  includeFromDay = false
): BroadcastRow[] {
  const slots = nextSendSlots(from, count, includeFromDay);
  return slots.map((scheduled_for, i) => {
    const c = BROADCAST_CAMPAIGNS[(rotationOffset + i) % BROADCAST_CAMPAIGNS.length];
    return { ...c, scheduled_for, status: "pending", template: BROADCAST_TEMPLATE };
  });
}

/**
 * Keeps the broadcast queue topped up so it never runs dry. If fewer than
 * REFILL_THRESHOLD future broadcast rows remain pending, appends enough to
 * reach REFILL_TARGET, continuing the cadence from the latest staged date and
 * the rotation from however many broadcast rows have existed so far.
 *
 * Safe to call on every cron fire — it's a no-op when the queue is healthy.
 * Returns the number of rows inserted.
 */
export async function refillBroadcastIfLow(supabase: SupabaseClient): Promise<number> {
  const nowIso = new Date().toISOString();

  // Future pending broadcast rows — the runway that still has to send.
  const { data: future, error: futureErr } = await supabase
    .from("promo_queue")
    .select("scheduled_for")
    .eq("template", BROADCAST_TEMPLATE)
    .eq("status", "pending")
    .gt("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: false });

  if (futureErr) {
    console.error("[promo-refill] Failed to read broadcast runway:", futureErr.message);
    return 0;
  }

  if ((future?.length ?? 0) >= REFILL_THRESHOLD) return 0;

  // Rotation offset: total broadcast rows ever created, so content keeps moving.
  const { count: totalBroadcast } = await supabase
    .from("promo_queue")
    .select("id", { count: "exact", head: true })
    .eq("template", BROADCAST_TEMPLATE);

  // Continue dating from the latest staged slot (or now if the queue is empty).
  const latest = future && future.length > 0 ? new Date(future[0].scheduled_for) : new Date();
  const toAdd = REFILL_TARGET - (future?.length ?? 0);

  const rows = buildBroadcastRows(latest, toAdd, totalBroadcast ?? 0, false);

  const { error: insErr } = await supabase.from("promo_queue").insert(rows);
  if (insErr) {
    console.error("[promo-refill] Insert failed:", insErr.message);
    return 0;
  }

  console.log(`[promo-refill] Topped up broadcast queue with ${rows.length} rows`);
  return rows.length;
}
