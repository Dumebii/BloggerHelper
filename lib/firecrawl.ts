import FirecrawlApp from '@mendable/firecrawl-js';

export const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export async function fetchPageContent(url: string): Promise<string> {
  try {
    const result = await firecrawl.scrape(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    });
    return result.markdown || '';
  } catch (err) {
    console.error('Firecrawl error:', err);
    return '';
  }
}