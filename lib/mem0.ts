import { MemoryClient } from 'mem0ai';

// 1. Pass an options object, not just a string
export const mem0 = new MemoryClient({ apiKey: process.env.MEM0_API_KEY || "" });

// Helper to store a memory
export async function storeMemory(userId: string, key: string, value: string) {
  try {
    // 2. Mem0 expects an array of messages, and an options object for scoping
    // Note: Mem0 doesn't natively support TTLs like a standard cache. 
    // It extracts the context from the content string you provide.
    await mem0.add(
      [{ role: 'user', content: `Please remember this fact: ${key} is ${value}` }],
      { user_id: userId }
    );
  } catch (err) {
    console.error('Mem0 store error:', err);
  }
}

// Helper to retrieve all memories for a user
export async function getMemories(userId: string): Promise<{ key: string; value: string }[]> {
  try {
    // 3. Use .getAll() to fetch by user_id, not .get()
    const memories = await mem0.getAll({ user_id: userId });
    
    // mem0.getAll() returns an array of Memory objects. 
    // We need to map them to match your expected return type of { key, value }[]
    return (memories || []).map((m: any) => ({
      key: 'extracted_memory',
      value: m.memory // Mem0 stores the extracted factual sentence in the 'memory' property
    }));
  } catch (err) {
    console.error('Mem0 get error:', err);
    return [];
  }
}