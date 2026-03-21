import { createClient } from '@supabase/supabase-js';

export type Plan = "trial" | "free" | "pro" | "power";

export interface PlanStatus {
  plan: Plan;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  canGenerate: boolean;
  generationsUsed: number;
  generationsLimit: number; // -1 means unlimited
  trialEndsAt: Date | null;
}

const GENERATION_LIMITS: Record<Plan, number> = {
  trial: Infinity,
  free: 5,
  pro: 30,
  power: Infinity,
};

export async function getPlanStatus(userId: string): Promise<PlanStatus> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("plan, trial_ends_at, generations_used_this_month, generation_reset_at")
    .eq("id", userId)
    .maybeSingle();
if (error) {
  console.error("Supabase profile fetch error:", error);
  throw new Error("Could not fetch user profile.");
}
  // If no profile exists, create one (should be handled by trigger, but just in case)
  if (!profile) {
    const now = new Date();
    const newProfile = {
      id: userId,
      plan: "trial",
      trial_started_at: now.toISOString(),
      trial_ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      generations_used_this_month: 0,
      generation_reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    };
    await supabaseAdmin.from("profiles").insert(newProfile);
    return {
      plan: "trial",
      isTrialActive: true,
      isTrialExpired: false,
      canGenerate: true,
      generationsUsed: 0,
      generationsLimit: Infinity,
      trialEndsAt: new Date(newProfile.trial_ends_at),
    };
  }

  const now = new Date();
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isTrialActive = profile.plan === "trial" && trialEndsAt !== null && now < trialEndsAt;
  const isTrialExpired = profile.plan === "trial" && trialEndsAt !== null && now >= trialEndsAt;

  // If trial expired, downgrade to free automatically
  if (isTrialExpired) {
    await supabaseAdmin
      .from("profiles")
      .update({ plan: "free" })
      .eq("id", userId);
  }

  const effectivePlan: Plan = isTrialExpired ? "free" : (profile.plan as Plan);
  const limit = GENERATION_LIMITS[effectivePlan];

  // Reset monthly generation count if past reset date
  const resetAt = profile.generation_reset_at ? new Date(profile.generation_reset_at) : null;
  let generationsUsed = profile.generations_used_this_month || 0;

  if (resetAt && now >= resetAt) {
    await supabaseAdmin
      .from("profiles")
      .update({
        generations_used_this_month: 0,
        generation_reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      })
      .eq("id", userId);
    generationsUsed = 0;
  }

  const canGenerate = limit === Infinity || generationsUsed < limit;

  return {
    plan: effectivePlan,
    isTrialActive,
    isTrialExpired,
    canGenerate,
    generationsUsed,
    generationsLimit: limit === Infinity ? -1 : limit,
    trialEndsAt,
  };
}

export async function incrementGenerationCount(userId: string): Promise<void> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.rpc("increment_generations", { user_id: userId });
  if (error) {
    console.warn("RPC increment failed, using manual update:", error);
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("generations_used_this_month")
      .eq("id", userId)
      .single();
    const current = profile?.generations_used_this_month || 0;
    await supabaseAdmin
      .from("profiles")
      .update({ generations_used_this_month: current + 1 })
      .eq("id", userId);
  }
}