import { test, expect } from "@playwright/test";

test.describe("WriterHelper v2.1 Security Model", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should keep Context Tank inputs disabled for guests", async ({
    page,
  }) => {
    const urlInput = page.getByPlaceholder("Paste an article URL here...");
    const textInput = page.getByPlaceholder(/Please connect GitHub/i);
    const submitBtn = page.getByRole("button", {
      name: /Synthesize Strategy/i,
    });

    await expect(urlInput).toBeDisabled();
    await expect(textInput).toBeDisabled();
    await expect(submitBtn).toBeDisabled();
  });
});
