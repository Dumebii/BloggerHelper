import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function usePersonas(userId?: string) {
  const [personas, setPersonas] = useState<any[]>([]);

  const fetchPersonas = async (uid: string) => {
    const { data } = await supabase
      .from("user_personas")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (data) setPersonas(data);
  };

  useEffect(() => {
    if (!userId) return;
    fetchPersonas(userId);
  }, [userId]);

  useEffect(() => {
    const handleRefresh = () => {
      if (userId) fetchPersonas(userId);
    };
    window.addEventListener("refreshPersonas", handleRefresh);
    return () => window.removeEventListener("refreshPersonas", handleRefresh);
  }, [userId]);

  return { personas, setPersonas, refreshPersonas: () => userId && fetchPersonas(userId) };
}