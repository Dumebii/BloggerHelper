import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useCampaignHistory(userId?: string) {
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);

  const fetchHistory = async (uid: string) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (data) setPastCampaigns(data);
  };

  const restoreCampaign = (record: any, setInputs: any, setCampaign: any) => {
    setInputs({
      url: record.source_url || "",
      text: record.source_notes || "",
      files: [],
      fileUrls: [],
      platforms: ["x", "linkedin", "discord", "email"],
      tweetFormat: "single",
      additionalInfo: "",
      personaId: "default",
    });
    setCampaign(record.generated_content);
  };

  return { pastCampaigns, fetchHistory, restoreCampaign };
}