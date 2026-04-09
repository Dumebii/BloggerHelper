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
  hasLongForm: boolean;
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

const LONG_FORM_ACCESS: Record<Plan, boolean> = {
  free: false,
  team: false,
  organization: true,
  enterprise: true,
};

export async function getPlanStatus(userId: string): Promise<PlanStatus> {
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch user email from auth
  let userEmail: string | undefined;
  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError) {
      console.error('Error fetching user email:', userError);
    } else {
      userEmail = userData.user.email;
    }
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
  }

  // 2. Admin override – return unlimited access
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return {
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
      hasLongForm: true,
      isEnterprise: false,
    };
  }

  // 3. Normal flow (for non-admin users)
  const now = new Date();

  // Fetch profile
  let { data: existingProfile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan, trial_started_at, trial_ends_at")
    .eq("id", userId)
    .maybeSingle();

  let profile: any;

  // If no profile exists, create one with trial
  if (!existingProfile) {
    const newProfile = {
      id: userId,
      plan: "team",
      trial_started_at: now.toISOString(),
      trial_ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await supabaseAdmin.from("profiles").insert(newProfile);
    profile = newProfile;
  } else {
    profile = existingProfile;
  }

  // Check trial status
  // Support both "trial" and "team" as trial plans (handle legacy data)
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isTrialPlan = profile.plan === "team" || profile.plan === "trial";
  const isTrialActive = isTrialPlan && trialEndsAt !== null && now < trialEndsAt;
  const isTrialExpired = isTrialPlan && trialEndsAt !== null && now >= trialEndsAt;

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

  // Map "trial" to "team" for limits lookup (trial users get team-level access)
  const effectivePlan: Plan = (profile.plan === "trial" ? "team" : profile.plan) as Plan;
  const generationsLimit = GENERATION_LIMITS[effectivePlan];
  const imageGenLimit = IMAGE_GEN_LIMITS[effectivePlan];
  const emailSendsLimit = EMAIL_SEND_LIMITS[effectivePlan];
  const hasCopilot = COPILOT_ACCESS[effectivePlan];
  const hasLongForm = LONG_FORM_ACCESS[effectivePlan];

  // Fetch usage stats
  let stats: {
    campaigns_generated: number;
    image_generations_this_month: number;
    email_sends_this_month: number;
  };

  const { data: existingStats, error: statsError } = await supabaseAdmin
    .from("user_stats")
    .select("campaigns_generated, image_generations_this_month, email_sends_this_month, generation_reset_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingStats) {
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
  } else {
    // Check if we need to reset monthly counters
    const resetAt = existingStats.generation_reset_at ? new Date(existingStats.generation_reset_at) : null;
    if (resetAt && now >= resetAt) {
      // Reset counters for the new month
      const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await supabaseAdmin
        .from("user_stats")
        .update({
          campaigns_generated: 0,
          image_generations_this_month: 0,
          email_sends_this_month: 0,
          generation_reset_at: nextResetDate.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("user_id", userId);
      
      stats = {
        campaigns_generated: 0,
        image_generations_this_month: 0,
        email_sends_this_month: 0,
      };
    } else {
      stats = existingStats;
    }
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
    hasLongForm,
    isEnterprise: effectivePlan === "enterprise",
  };
}

export async function incrementCampaignGeneration(userId: string): Promise<void> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabaseAdmin.rpc('increment_campaigns_generated', { user_id_param: userId });
  if (error) {
    console.error('RPC increment_campaigns_generated error:', error);
  } else {
    console.log('Campaign increment RPC called successfully for user', userId);
  }
}

export async function incrementImageGeneration(userId: string): Promise<void> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabaseAdmin.rpc('increment_image_generations', { user_id_param: userId });
  if (error) console.error('Error incrementing image generations:', error);
}

export async function incrementEmailSend(userId: string): Promise<void> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabaseAdmin.rpc('increment_email_sends', { user_id_param: userId });
  if (error) console.error('Error incrementing email sends:', error);
}
