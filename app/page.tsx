import { createAdminClient } from "@/lib/supabase/admin";
import { fetchInfluencers } from "@/lib/data";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

// Access to this page is already gated by middleware.ts (the shared dashboard
// password), so it's safe to read with the service_role key here rather than
// relying on Supabase's own row-level security, which has no notion of that
// password gate.
export default async function Page() {
  const supabase = createAdminClient();
  const influencers = await fetchInfluencers(supabase);
  return <Dashboard initialInfluencers={influencers} />;
}
