import { test, expect } from "@playwright/test";

test.describe("WriterHelper v2.1 Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the new Hero Section and Branding", async ({ page }) => {
    // Verify the rebranded Header
    await expect(page.locator("h1")).toContainText("WriterHelper");

    // Verify the Hero Section text you just added
    await expect(page.getByText("Turn Research into Reach.")).toBeVisible();
    await expect(page.getByText("Agentic Content Engine")).toBeVisible();
  });

  test("should verify the new Footer and Social Links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Check for the 2026 date and developer links
    await expect(footer).toContainText("2026");
    await expect(page.getByRole("link", { name: /Dev.to/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /LinkedIn/i })).toBeVisible();
  });

  test("should hide distribution pipelines by default", async ({ page }) => {
    // Pipelines should not exist until a campaign is generated
    await expect(page.getByText("X Pipeline")).not.toBeVisible();
    await expect(page.getByText("LinkedIn Pipeline")).not.toBeVisible();
  });
});
