import { createClient } from '@supabase/supabase-js';

export type Plan = "free" | "team" | "organization" | "enterprise";

export interface PlanStatus {
  plan: Plan;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialEndsAt: Date | null;
  canGenerate: boolean;
  generationsUsed: number;
  generationsLimit: number;
  imageGenUsed: number;
  imageGenLimit: number;
  emailSendsUsed: number;
  emailSendsLimit: number;
  hasCopilot: boolean;
  isEnterprise: boolean;
}

// Limits per plan (base limits – trial uses team limits)
const GENERATION_LIMITS: Record<Plan, number> = {
  free: 5,
  team: 30,
  organization: -1,
  enterprise: -1,
};

const IMAGE_GEN_LIMITS: Record<Plan, number> = {
  free: 0,
  team: 2,
  organization: -1,
  enterprise: -1,
};

const EMAIL_SEND_LIMITS: Record<Plan, number> = {
  free: 0,
  team: 500,
  organization: -1,
  enterprise: -1,
};

const COPILOT_ACCESS: Record<Plan, boolean> = {
  free: false,
  team: false,
  organization: true,
  enterprise: true,
};



export async function getPlanStatus(userId: string): Promise<PlanStatus> {
  
const ADMIN_EMAILS = ['okolodumebi@gmail.com']; 

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );


  
  const now = new Date();

  // Fetch profile
  let { data: existingProfile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan, trial_started_at, trial_ends_at")
    .eq("id", userId)
    .single();

  let profile: any;

  // If no profile exists, create one with trial
  if (profileError && profileError.code === 'PGRST116') {
    const newProfile = {
      id: userId,
      plan: "team",
      trial_started_at: now.toISOString(),
      trial_ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await supabaseAdmin.from("profiles").insert(newProfile);
    profile = newProfile;
  } else if (profileError) {
    throw new Error("Could not fetch user profile.");
  } else {
    profile = existingProfile;
  }

  // Check trial status
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isTrialActive = profile.plan === "team" && trialEndsAt !== null && now < trialEndsAt;
  const isTrialExpired = profile.plan === "team" && trialEndsAt !== null && now >= trialEndsAt;

  // If trial expired, downgrade to free and clear trial dates
  if (isTrialExpired) {
    await supabaseAdmin
      .from("profiles")
      .update({ plan: "free", trial_ends_at: null, trial_started_at: null })
      .eq("id", userId);
    profile.plan = "free";
    profile.trial_ends_at = null;
    profile.trial_started_at = null;
  }

  const effectivePlan: Plan = profile.plan as Plan;
  const generationsLimit = GENERATION_LIMITS[effectivePlan];
  const imageGenLimit = IMAGE_GEN_LIMITS[effectivePlan];
  const emailSendsLimit = EMAIL_SEND_LIMITS[effectivePlan];
  const hasCopilot = COPILOT_ACCESS[effectivePlan];

  // Fetch usage stats
  let stats: {
    campaigns_generated: number;
    image_generations_this_month: number;
    email_sends_this_month: number;
  };

  const { data: existingStats, error: statsError } = await supabaseAdmin
    .from("user_stats")
    .select("campaigns_generated, image_generations_this_month, email_sends_this_month")
    .eq("user_id", userId)
    .single();
    const userEmail = profile?.email;
if (ADMIN_EMAILS.includes(userEmail)) {   return {
    plan: 'organization',
    isTrialActive: false,
    isTrialExpired: false,
    trialEndsAt: null,
    canGenerate: true,
    generationsUsed: 0,
    generationsLimit: -1,
    imageGenUsed: 0,
    imageGenLimit: -1,
    emailSendsUsed: 0,
    emailSendsLimit: -1,
    hasCopilot: true,
    isEnterprise: false,
  };
 }

  if (statsError && statsError.code === 'PGRST116') {
    // Create stats row
    const nowDate = new Date();
    const newStats = {
      user_id: userId,
      campaigns_generated: 0,
      image_generations_this_month: 0,
      email_sends_this_month: 0,
      generation_reset_at: new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1).toISOString(),
    };
    await supabaseAdmin.from("user_stats").insert(newStats);
    stats = {
      campaigns_generated: 0,
      image_generations_this_month: 0,
      email_sends_this_month: 0,
    };
  } else if (statsError) {
    console.error("Stats error:", statsError);
    stats = { campaigns_generated: 0, image_generations_this_month: 0, email_sends_this_month: 0 };
  } else {
    stats = existingStats!;
  }

  return {
    plan: effectivePlan,
    isTrialActive,
    isTrialExpired,
    trialEndsAt,
    canGenerate: generationsLimit === -1 || stats.campaigns_generated < generationsLimit,
    generationsUsed: stats.campaigns_generated,
    generationsLimit: generationsLimit === -1 ? -1 : generationsLimit,
    imageGenUsed: stats.image_generations_this_month,
    imageGenLimit: imageGenLimit === -1 ? -1 : imageGenLimit,
    emailSendsUsed: stats.email_sends_this_month,
    emailSendsLimit: emailSendsLimit === -1 ? -1 : emailSendsLimit,
    hasCopilot,
    isEnterprise: effectivePlan === "enterprise",
  };
}

// Increment functions (unchanged)
export async function incrementCampaignGeneration(userId: string): Promise<void> {
  await incrementStat(userId, "campaigns_generated");
}

export async function incrementImageGeneration(userId: string): Promise<void> {
  await incrementStat(userId, "image_generations_this_month");
}

export async function incrementEmailSend(userId: string): Promise<void> {
  await incrementStat(userId, "email_sends_this_month");
}

async function incrementStat(userId: string, column: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch the full record
  const { data: current, error: fetchError } = await supabaseAdmin
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error fetching stats for increment:", fetchError);
    return;
  }

  const newStats: any = current ? { ...current } : { user_id: userId };

  // Increment the correct column
  if (column === 'campaigns_generated') {
    newStats.campaigns_generated = (newStats.campaigns_generated || 0) + 1;
  } else if (column === 'image_generations_this_month') {
    newStats.image_generations_this_month = (newStats.image_generations_this_month || 0) + 1;
  } else if (column === 'email_sends_this_month') {
    newStats.email_sends_this_month = (newStats.email_sends_this_month || 0) + 1;
  } else {
    console.error("Invalid column for incrementStat:", column);
    return;
  }

  // If the record didn't exist, set sensible defaults for other columns
  if (!current) {
    newStats.campaigns_generated = newStats.campaigns_generated || 0;
    newStats.image_generations_this_month = newStats.image_generations_this_month || 0;
    newStats.email_sends_this_month = newStats.email_sends_this_month || 0;
    newStats.generation_reset_at = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();
  }

  const { error: updateError } = await supabaseAdmin
    .from("user_stats")
    .upsert(newStats, { onConflict: 'user_id' });

  if (updateError) {
    console.error("Error updating stats:", updateError);
  }
}