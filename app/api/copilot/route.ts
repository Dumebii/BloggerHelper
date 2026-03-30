import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getVertexAIClient } from '@/lib/genai-client';
import { searchWebWithExa } from '@/lib/exa';
import { getMemories, storeMemory } from '@/lib/mem0';

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            /* ignored */
          },
        },
      },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch user context
    const { data: profile } = await supabase
      .from('profiles')
      .select('copilot_context')
      .eq('id', user.id)
      .single();
    const userContext = profile?.copilot_context?.trim() || '';

    // 2a. Retrieve user memories
    const userMemories = await getMemories(user.id);
    const memoryContext = userMemories.map(m => `${m.key}: ${m.value}`).join('\n');

    // 3. Parse incoming messages and search flag
    const { messages, search = false } = await req.json();

    // 4. If search is enabled, get results for the last user message
    let searchResults = '';
    if (search) {
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content;
      if (lastUserMsg) {
        try {
          const results = await searchWebWithExa(lastUserMsg);
          if (results.length > 0) {
            searchResults = '\n\nWeb Search Results:\n' + results.map((r: any, i: number) => 
              `${i + 1}. ${r.title}\n   ${r.text}...\n   Source: ${r.url}`
            ).join('\n\n');
          } else {
            searchResults = '\n\nNo search results found.';
          }
        } catch (err) {
          console.error('Exa search error:', err);
          searchResults = '\n\nSearch failed. Please try again later.';
        }
      }
    }

    // 5. Build the contents array with system context and memory context
    const fullContext = userContext + searchResults;
    const systemMessage = fullContext.trim()
      ? { role: 'user', parts: [{ text: fullContext }] }
      : null;

    const contents = [
      ...(systemMessage ? [systemMessage] : []),
      ...(memoryContext ? [{ role: 'user', parts: [{ text: `Relevant memories: ${memoryContext}` }] }] : []),
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    // 6. Use the new GenAI client for streaming
    const client = await getVertexAIClient();
    const streamingResponse = await client.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
    });

// 7. Store a memory about the conversation (fire-and-forget to avoid blocking the stream)
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content;
    if (lastUserMessage) {
      const key = `last_question_${Date.now()}`;
      
      // Removed the 4th TTL argument so it matches our updated storeMemory function
      storeMemory(user.id, key, lastUserMessage).catch(err => 
        console.error('Mem0 store error:', err)
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamingResponse) {
          if (chunk.text) {
            controller.enqueue(new TextEncoder().encode(chunk.text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}