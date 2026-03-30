import Exa from 'exa-js';

export const exa = new Exa(process.env.EXA_API_KEY);

export async function searchWebWithExa(query: string) {
  try {
    const result = await exa.search(query, {
      numResults: 5,
      useAutoprompt: true,
      type: 'neural',
    });
    return result.results.map((r) => ({
      title: r.title,
      url: r.url,
      text: r.text?.slice(0, 800) || '',
    }));
  } catch (err) {
    console.error('Exa search error:', err);
    return [];
  }
}