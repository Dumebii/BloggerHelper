import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface PlanStatus {
  plan: 'free' | 'team' | 'organization' | 'enterprise';
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

export function usePlanStatus() {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanStatus = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/user/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // The stats endpoint now includes all plan fields
          setPlanStatus({
            plan: data.plan,
            isTrialActive: data.isTrialActive,
            isTrialExpired: data.isTrialExpired,
            trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
            canGenerate: data.canGenerate,
            generationsUsed: data.generationsUsed,
            generationsLimit: data.generationsLimit,
            imageGenUsed: data.imageGenUsed,
            imageGenLimit: data.imageGenLimit,
            emailSendsUsed: data.emailSendsUsed,
            emailSendsLimit: data.emailSendsLimit,
            hasCopilot: data.hasCopilot,
            isEnterprise: data.isEnterprise,
          });
        }
      } catch (err) {
        console.error('Failed to fetch plan status', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanStatus();
  }, []);

  return { planStatus, loading };
}