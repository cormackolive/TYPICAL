import type { SupabaseClient } from "@supabase/supabase-js";
import type { InfluencerDb } from "./types";

export async function fetchInfluencers(supabase: SupabaseClient): Promise<InfluencerDb[]> {
  const { data, error } = await supabase
    .from("influencer")
    .select("*, shopify_order(*)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as InfluencerDb[];
}

export function latestOrder(inf: InfluencerDb) {
  if (!inf.shopify_order?.length) return null;
  return [...inf.shopify_order].sort((a, b) =>
    (b.order_date ?? "").localeCompare(a.order_date ?? "")
  )[0];
}
