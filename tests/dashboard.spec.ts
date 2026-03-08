import { test, expect } from '@playwright/test';

test.describe('Ozigi Context Engine & Persona Flow', () => {
  
  // OPTIONAL: If your dashboard is protected by Supabase auth, 
  // you might need a globalSetup to inject a logged-in session cookie here, 
  // or use Playwright's storageState. Let's assume the page loads for this test.

  test('should create a persona, intercept AI, and render the campaign', async ({ page }) => {
    
    // 1. Navigate to the dashboard
    await page.goto('/dashboard');

    // 2. Handle the standard browser alert that pops up when saving a persona
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Persona saved successfully!');
      await dialog.accept();
    });

    // --- TEST PART A: THE RADIO TOWER & SETTINGS MODAL ---
    
    // Select the "Create New Persona" option from the dropdown
    // Note: Adjust the locator if your select has a specific label/ID
    await page.locator('select').selectOption('create_new');

    // Assert the Settings Modal opened by checking for the specific header
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Fill out the new Persona details
    await page.getByPlaceholder('e.g., Snarky Indie Hacker').fill('Test Engineer Persona');
    await page.getByPlaceholder('e.g., Write with high burstiness...').fill('Always use brackets.');
    
    // Save it and ensure the modal closes
    await page.getByRole('button', { name: '+ Save New Persona' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();


    // --- TEST PART B: THE CONTEXT ENGINE & NETWORK MOCKING ---

    // Fill out the Context fields (adjust placeholders to match your actual UI)
    // Assuming you have an input for URL and a textarea for the Additional Directives
    await page.getByPlaceholder('Paste a URL').fill('https://ozigi.app/docs');
    
    // Mock the Vertex AI backend response
    await page.route('**/api/generate', async (route) => {
      const jsonResponse = {
        output: JSON.stringify({
          campaign: [
            {
              day: 1,
              x: "Day 1 Thread: Ozigi is tested and working! 1/2\n\n[The content engine is officially alive.]",
              linkedin: "LinkedIn Post: Ozigi testing complete.",
              discord: "Discord Update: Systems green."
            }
          ]
        })
      };
      
      // Fulfill the route with our fake, instant AI response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(jsonResponse),
      });
    });

    // Click the Generate Button
    await page.getByRole('button', { name: /Generate Campaign/i }).click();

    // Assert the Dynamic Loader appears immediately
    // Looking for the specific container classes we added earlier
    const loaderContainer = page.locator('.animate-in.fade-in');
    await expect(loaderContainer).toBeVisible();

    // Assert the mocked data is rendered into the Distribution Grid
    // Wait for the loader to disappear and the grid to render
    await expect(page.getByText('Ozigi is tested and working!')).toBeVisible();
    await expect(page.getByText('[The content engine is officially alive.]')).toBeVisible();
  });
});
