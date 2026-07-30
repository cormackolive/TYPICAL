import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchInfluencers } from "@/lib/data";
import { requireDashboardSession } from "@/lib/auth";

// Called from the browser (Dashboard.tsx) to refresh data. Uses the service_role
// key server-side because the dashboard's access control is the shared password
// gate in middleware.ts, not Supabase row-level security. middleware.ts excludes
// all of /api, so this route must check the session itself.
export async function GET() {
  if (!(await requireDashboardSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const influencers = await fetchInfluencers(supabase);
  return NextResponse.json(influencers);
}
