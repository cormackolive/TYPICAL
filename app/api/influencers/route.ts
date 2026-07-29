import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchInfluencers } from "@/lib/data";

// Called from the browser (Dashboard.tsx) to refresh data. Uses the service_role
// key server-side because the dashboard's access control is the shared password
// gate in middleware.ts, not Supabase row-level security.
export async function GET() {
  const supabase = createAdminClient();
  const influencers = await fetchInfluencers(supabase);
  return NextResponse.json(influencers);
}
