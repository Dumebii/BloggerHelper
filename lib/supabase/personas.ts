import { supabase } from "@/lib/supabase/client";

export interface MarketplacePersona {
  id: string;
  name: string;
  prompt: string;
  description: string;
  is_featured: boolean;
  order_index?: number;
}

/**
 * Fetch all marketplace personas (the 8 pre-built ones)
 */
export async function getMarketplacePersonas(): Promise<MarketplacePersona[]> {
  const { data, error } = await supabase
    .from("marketplace_personas")
    .select("*");

  if (error) {
    console.error("[Personas] Error fetching marketplace personas:", error.message, error.code, error.details);
    return [];
  }

  // Sort by order_index if it exists, otherwise by name
  const sorted = (data || []).sort((a, b) => {
    if (a.order_index !== undefined && b.order_index !== undefined) {
      return a.order_index - b.order_index;
    }
    return a.name.localeCompare(b.name);
  });

  return sorted;
}

/**
 * Save a marketplace persona to user's personal personas and redirect to dashboard
 * This copies the marketplace persona to user_personas table
 */
export async function savePersonaAndRedirect(
  userId: string,
  personaName: string,
  personaPrompt: string
): Promise<{ success: boolean; personaId?: string; error?: string }> {
  try {
    // Check if user already has this persona saved
    const { data: existing } = await supabase
      .from("user_personas")
      .select("id")
      .eq("user_id", userId)
      .eq("name", personaName)
      .maybeSingle();

    if (existing) {
      // Already saved, just return the ID
      return { success: true, personaId: existing.id };
    }

    // Insert new persona
    const { data: inserted, error: insertError } = await supabase
      .from("user_personas")
      .insert({
        user_id: userId,
        name: personaName,
        prompt: personaPrompt,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Personas] Error saving persona:", insertError);
      return { success: false, error: insertError.message };
    }

    // Trigger refresh event for other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("refreshPersonas"));
    }

    return { success: true, personaId: inserted.id };
  } catch (error: any) {
    console.error("[Personas] Unexpected error:", error);
    return { success: false, error: error.message };
  }
}
