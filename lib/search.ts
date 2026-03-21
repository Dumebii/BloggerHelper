export async function searchWeb(query: string) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      include_answer: true,
      max_results: 5,
    }),
  });
  if (!response.ok) throw new Error("Search failed");
  const data = await response.json();
  return data; // Contains answer and results
}