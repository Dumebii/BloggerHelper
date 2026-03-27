import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { searchWeb } from '@/lib/search';
import { getVertexAIClient } from '@/lib/genai-client';

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

    // 3. Parse incoming messages and search flag
    const { messages, search = false } = await req.json();

    // 4. If search is enabled, get results for the last user message
    let searchResults = '';
    if (search) {
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content;
      if (lastUserMsg) {
        try {
          const results = await searchWeb(lastUserMsg);
          searchResults = `\n\nWeb Search Results:\n${JSON.stringify(results, null, 2)}`;
        } catch (err) {
          console.error('Search error:', err);
          searchResults = '\n\nSearch failed. Please try again later.';
        }
      }
    }

    // 5. Build the contents array with system context first
    const fullContext = userContext + searchResults;
    const systemMessage = fullContext.trim()
      ? { role: 'user', parts: [{ text: fullContext }] }
      : null;

    const contents = [
      ...(systemMessage ? [systemMessage] : []),
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