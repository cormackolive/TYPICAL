import { createAdminClient } from "@/lib/supabase/admin";
import { fetchInfluencers } from "@/lib/data";
import Dashboard from "@/components/Dashboard";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const supabase = createAdminClient();
  const influencers = await fetchInfluencers(supabase);
  return (
    <>
      <NavBar section="Influencer Tracker" />
      <Dashboard initialInfluencers={influencers} />
    </>
  );
}
