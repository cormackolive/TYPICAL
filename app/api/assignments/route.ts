import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireDashboardSession } from "@/lib/auth";

export async function GET() {
  if (!(await requireDashboardSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("assignment").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await requireDashboardSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("assignment")
    .insert({
      influencer_name: body.influencer_name ?? null,
      team_member: body.team_member ?? null,
      message: body.message ?? null,
      due_date: body.due_date || null,
      status: "Pending",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
