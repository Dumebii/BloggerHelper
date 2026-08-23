/**
 * AI Slop Checker (/slop-checker) — public tool page.
 *
 * These are the shipping guarantees for the page, in test form:
 *   - clean, specific writing scores 90+
 *   - buzzword-dense writing scores 0–30
 *   - switching context re-scores the SAME text (the multiplier is live)
 *   - the CTA re-routes to the generator matching the selected context
 *   - highlighted spans don't overlap or double-count
 *   - "Check my writing" fires NO network request — the pasted text never
 *     leaves the browser, which is what the page's privacy copy promises
 *
 * Runs unauthenticated. No generation API is involved: the whole check is
 * client-side pattern matching against the bundled banned lexicon.
 */

import { test, expect, type Page } from "@playwright/test";

const CLEAN_SAMPLE = `We shipped the new pricing page on a Tuesday and broke checkout for about forty minutes. The bug was mine: I renamed the plan slug from "growth" to "growth-annual" in the database but forgot the webhook handler still matched on the old string, so every payment came back with no plan attached. Nobody emailed us. Two people posted about it in our Discord, which is how we found out. We rolled back, added a test that fails if a slug exists in one place and not the other, and shipped again on Thursday. Total damage: nine failed signups, seven of whom came back. I still think renaming the slug was right. I just should have grepped for it first.`;

const SLOP_SAMPLE = `In today's fast-paced digital landscape, businesses must navigate the complexities of an ever-evolving market. It's not just about working harder, it's about working smarter. Our cutting-edge platform empowers teams to unlock their full potential and seamlessly integrate best practices into their daily workflow. By leveraging robust, data-driven insights, forward thinking organisations can foster a vibrant culture of innovation and elevate their customer-centric approach to new heights. Moreover, our holistic solution streamlines mission-critical processes, delivering tangible results that move the needle. Ultimately, it is a testament to the transformative power of technology. What do you think?`;

const MIXED_SAMPLE = `Our platform helps growing teams work smarter. We built it after talking to about two hundred sales managers who told us the same thing: their reps spend more time updating records than talking to customers. So we automated the record updating. Sales calls get transcribed, the transcript gets parsed for the four fields your pipeline actually cares about, and the record updates itself. It is a robust solution for teams who want to streamline their workflow and gain valuable insights from every conversation. Pricing starts at twenty nine dollars per seat. There is a fourteen day trial and we do not ask for a card up front.`;

async function check(page: Page, text: string) {
  await page.locator('textarea[aria-label="Text to check"]').fill(text);
  await page.getByRole("button", { name: /check my writing/i }).click();
  await expect(page.getByText("Human Score")).toBeVisible({ timeout: 10_000 });
}

/** The big number in the score badge. */
async function readScore(page: Page): Promise<number> {
  const raw = await page.locator("span.tabular-nums").first().textContent();
  return Number((raw || "").trim());
}

test.describe("Slop checker page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/slop-checker");
  });

  test("loads with the hero, the context selector, and the methodology section", async ({ page }) => {
    await expect(page).toHaveTitle(/slop checker/i);
    await expect(page.locator("h1")).toContainText(/sound like you/i);
    for (const label of ["General", "Cold email", "LinkedIn post", "Newsletter", "Blog post"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.locator("#methodology")).toBeAttached();
  });

  test("live word count warns below the 40-word minimum, then just counts", async ({ page }) => {
    const textarea = page.locator('textarea[aria-label="Text to check"]');
    await textarea.fill("Only a handful of words here.");
    await expect(page.getByText(/40 minimum for an accurate score/)).toBeVisible();
    await textarea.fill(CLEAN_SAMPLE);
    await expect(page.getByText(/^\d+ words$/)).toBeVisible();
  });

  test("clean, specific writing scores 90+", async ({ page }) => {
    await check(page, CLEAN_SAMPLE);
    expect(await readScore(page)).toBeGreaterThanOrEqual(90);
    await expect(page.getByText("Reads human").first()).toBeVisible();
  });

  test("buzzword-dense writing scores 30 or below", async ({ page }) => {
    await check(page, SLOP_SAMPLE);
    expect(await readScore(page)).toBeLessThanOrEqual(30);
    await expect(page.getByText(/heavy ai slop|sounds ai-generated/i).first()).toBeVisible();
  });

  test("switching context re-scores the same text and re-routes the CTA", async ({ page }) => {
    await check(page, MIXED_SAMPLE);

    const cta = page.getByRole("link", { name: /fix this in ozigi/i });

    await page.getByRole("button", { name: "General", exact: true }).click();
    const generalScore = await readScore(page);
    await expect(cta).toHaveAttribute("href", "/long-form");

    await page.getByRole("button", { name: "Cold email", exact: true }).click();
    const emailScore = await readScore(page);
    await expect(cta).toHaveAttribute("href", "/email-outreach");

    // Cold email carries the heavier multiplier, so the same text must score
    // strictly lower there. If these ever come out equal the multiplier has
    // stopped being applied.
    expect(emailScore).toBeLessThan(generalScore);

    await page.getByRole("button", { name: "LinkedIn post", exact: true }).click();
    await expect(cta).toHaveAttribute("href", "/linkedin-outreach");

    await page.getByRole("button", { name: "Newsletter", exact: true }).click();
    await expect(cta).toHaveAttribute("href", "/newsletter");

    await page.getByRole("button", { name: "Blog post", exact: true }).click();
    await expect(cta).toHaveAttribute("href", "/long-form");
    // Blog is the lightest multiplier, so it must score above general.
    expect(await readScore(page)).toBeGreaterThan(generalScore);
  });

  test("flagged spans are highlighted, explained, and never overlap", async ({ page }) => {
    await check(page, SLOP_SAMPLE);

    const marks = page.locator("button[title]");
    const count = await marks.count();
    expect(count).toBeGreaterThan(5);

    // Every highlight carries its own reason.
    for (const title of await marks.evaluateAll((els) => els.map((e) => e.getAttribute("title") || ""))) {
      expect(title.length).toBeGreaterThan(20);
    }

    // Concatenating the highlights must not repeat any character of the
    // source — the engine dedupes by span, and rendering has to preserve that.
    const rendered = await page
      .locator(".whitespace-pre-wrap")
      .first()
      .evaluate((el) => (el as HTMLElement).innerText.replace(/\s+/g, " ").trim());
    expect(rendered).toBe(SLOP_SAMPLE.replace(/\s+/g, " ").trim());

    // Clicking a highlight surfaces the explanation panel.
    await marks.first().click();
    await expect(page.getByText(/generic AI-vocabulary word|formulaic filler phrase|contrast framing|essay-transition opener/i).first()).toBeVisible();
  });

  test("checking sends no network request — the pasted text stays in the browser", async ({ page }) => {
    await page.locator('textarea[aria-label="Text to check"]').fill(SLOP_SAMPLE);

    const appRequests: string[] = [];
    const leaks: string[] = [];
    // A distinctive fragment of the pasted text — if this shows up in any
    // outbound body, the privacy claim in the copy is false.
    const canary = "forward thinking organisations";

    page.on("request", (req) => {
      const url = req.url();
      const body = req.postData() || "";
      if (body.includes(canary) || decodeURIComponent(url).includes(canary)) {
        leaks.push(`${req.method()} ${url}`);
      }
      // Framework traffic (RSC payloads, HMR, chunk loading) isn't the subject
      // here, and neither is Sentry's own telemetry envelope — that fires on a
      // timer regardless of this page. What must not happen is the app itself
      // calling an endpoint when the visitor hits check.
      if (url.includes("/_next/") || url.includes("__nextjs") || url.includes("sentry.io")) return;
      if (["xhr", "fetch"].includes(req.resourceType())) {
        appRequests.push(`${req.method()} ${url}`);
      }
    });

    await page.getByRole("button", { name: /check my writing/i }).click();
    await expect(page.getByText("Human Score")).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1_000);

    expect(leaks, `pasted text left the browser: ${leaks.join(", ")}`).toHaveLength(0);
    expect(appRequests, `unexpected requests: ${appRequests.join(", ")}`).toHaveLength(0);
  });

  test("the pasted text and the marked-up output are masked from session replay", async ({ page }) => {
    // Sentry's replay envelopes are compressed, so a request-body canary can't
    // prove this — the guarantee lives in the config and in these attributes.
    // If either disappears, the privacy copy on the page stops being true.
    await check(page, SLOP_SAMPLE);
    await expect(page.locator('textarea[aria-label="Text to check"]')).toHaveAttribute(
      "data-sentry-mask",
      "true"
    );
    await expect(page.locator('[data-sentry-mask="true"].whitespace-pre-wrap')).toHaveCount(1);
  });

  test("is usable at mobile width without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await check(page, MIXED_SAMPLE);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflows).toBe(false);
  });

  test("is reachable from the footer's Free Tools list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('footer a[href="/slop-checker"]')).toHaveCount(1);
  });
});
