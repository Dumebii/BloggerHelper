import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function useStats(userId?: string) {
  const [stats, setStats] = useState({ campaignsGenerated: 0, scheduledCount: 0, personasSaved: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    if (!userId) {
      setIsLoadingStats(false);
      return;
    }
    try {
      const [statsRes, scheduledRes] = await Promise.all([
        supabase
          .from("user_stats")
          .select("campaigns_generated, posts_published, personas_saved")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("scheduled_posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "pending"),
      ]);

      if (statsRes.data) {
        setStats({
          campaignsGenerated: statsRes.data.campaigns_generated || 0,
          scheduledCount: scheduledRes.count || 0,
          personasSaved: statsRes.data.personas_saved || 0,
        });
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
    setIsLoadingStats(false);
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const refreshStats = () => fetchStats();

  return { stats, isLoadingStats, refreshStats };
}