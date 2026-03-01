import { test, expect } from "@playwright/test";

test("should allow inline editing of generated posts", async ({ page }) => {
  // 1. MOCK THE API: Intercept the request so we don't hit the real Gemini API
  await page.route("/api/generate", async (route) => {
    const fakeResponse = {
      output: JSON.stringify({
        campaign: [
          {
            day: 1,
            x: "Mocked X Post",
            linkedin: "Mocked LI",
            discord: "Mocked Discord",
          },
        ],
      }),
    };
    await route.fulfill({ json: fakeResponse });
  });

  // 2. Navigate to the app
  await page.goto("/");

  // 3. Trigger the generation
  const input = page.getByPlaceholder(/Source article URL/i);
  await input.fill("https://dev.to/dumebii/test-article");
  await page.getByRole("button", { name: /Architect/i }).click();

  // 4. Wait for the actual mocked card to appear (looking for the specific emoji)
  const editBtn = page.getByRole("button", { name: /✏️ Edit/i }).first();
  await expect(editBtn).toBeVisible(); // This wait is now safe and instant!
  await editBtn.click();

  // 5. Test the Edit logic
  const textarea = page.locator("textarea");
  await textarea.fill("This is a manual QA edit.");

  const saveBtn = page.getByRole("button", { name: /💾 Save/i });
  await saveBtn.click();

  // 6. Verify the edit was saved to the DOM
  await expect(page.getByText("This is a manual QA edit.")).toBeVisible();
});
