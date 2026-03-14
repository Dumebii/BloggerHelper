import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface ScrapeResult {
  success: boolean;
  content?: string;
  error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    // Deliberately using playwright:firefox to handle JS-rendered pages reliably
    const run = await client.actor("apify/website-content-crawler").call({
      startUrls: [{ url }],
      maxCrawlPages: 1,
      crawlerType: "playwright:firefox", 
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (items.length === 0) {
      return { success: false, error: "No content could be extracted from this URL." };
    }

    const firstItem = items[0] as Record<string, unknown>;
    const rawContent = (firstItem.markdown || firstItem.text || "") as string;

    if (!rawContent.trim()) {
      return { success: false, error: "Page was reached but content was empty." };
    }

    // Trim to 8000 characters safe for Gemini 2.5 Flash context window
    const content = rawContent.slice(0, 8000);
    
    // Log the dataset URL during development for verification as requested
    console.log(`Apify Dataset URL: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);

    return { success: true, content };
  } catch (error: any) {
    return { 
      success: false, 
      error: `Apify scrape failed: ${error instanceof Error ? error.message : "Unknown error"}` 
    };
  }
}