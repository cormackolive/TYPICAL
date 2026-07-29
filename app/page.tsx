import { createClient } from "@/lib/supabase/server";
import { fetchInfluencers } from "@/lib/data";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const influencers = await fetchInfluencers(supabase);
  return <Dashboard initialInfluencers={influencers} />;
}
