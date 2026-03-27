"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useStats(userId?: string) {
  const [stats, setStats] = useState({ campaignsGenerated: 0, scheduledCount: 0, personasSaved: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setIsLoadingStats(false);
      return;
    }

    try {
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("campaigns_generated")
        .eq("user_id", userId)
        .maybeSingle();
      if (statsError) console.error("Stats error:", statsError);

      const { count: scheduledCount, error: scheduledError } = await supabase
        .from("scheduled_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "pending");
      if (scheduledError) console.error("Scheduled error:", scheduledError);

      const { count: personasCount, error: personasError } = await supabase
        .from("user_personas")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (personasError) console.error("Personas error:", personasError);

      setStats({
        campaignsGenerated: statsData?.campaigns_generated || 0,
        scheduledCount: scheduledCount || 0,
        personasSaved: personasCount || 0,
      });
    } catch (e) {
      console.error("Failed to fetch stats", e);
    } finally {
      setIsLoadingStats(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshStats = useCallback(() => {
    setIsLoadingStats(true);
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoadingStats, refreshStats };
}