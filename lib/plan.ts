import { createClient } from '@supabase/supabase-js';

// Default limits for free tier
const FREE_GENERATIONS_LIMIT = 5;
const PRO_GENERATIONS_LIMIT = 100; // Adjust as needed

export async function getPlanStatus(userId: string) {
  // Use service role client to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Must be set in env
  );

  try {
    // 1. Try to fetch existing profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('plan, generations_used, generations_limit')
      .eq('id', userId)
      .maybeSingle(); // 👈 Use maybeSingle to avoid error if not found

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Database error while fetching profile');
    }

    // 2. If profile doesn't exist, create one
    if (!profile) {
      const defaultProfile = {
        id: userId,
        plan: 'free',
        generations_used: 0,
        generations_limit: FREE_GENERATIONS_LIMIT,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert(defaultProfile);

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw new Error('Could not create user profile');
      }

      return {
        plan: 'free',
        generationsUsed: 0,
        generationsLimit: FREE_GENERATIONS_LIMIT,
        canGenerate: true,
      };
    }

    // 3. Return existing profile data
    return {
      plan: profile.plan || 'free',
      generationsUsed: profile.generations_used || 0,
      generationsLimit: profile.generations_limit || FREE_GENERATIONS_LIMIT,
      canGenerate: (profile.generations_used || 0) < (profile.generations_limit || FREE_GENERATIONS_LIMIT),
    };
  } catch (err) {
    console.error('getPlanStatus error:', err);
    // Fail open? For now, allow generation with a warning.
    // Better to throw so the API route can handle it.
    throw err;
  }
}

export async function incrementGenerationCount(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Increment the generations_used counter
  const { error } = await supabaseAdmin.rpc('increment_generations', {
    user_id: userId,
  });

  // If RPC doesn't exist, fallback to manual update
  if (error) {
    console.warn('RPC increment failed, using manual update:', error);
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('generations_used')
      .eq('id', userId)
      .single();

    const current = profile?.generations_used || 0;
    await supabaseAdmin
      .from('profiles')
      .update({ generations_used: current + 1 })
      .eq('id', userId);
  }
}