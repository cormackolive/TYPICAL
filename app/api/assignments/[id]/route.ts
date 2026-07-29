import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EDITABLE_FIELDS = ["influencer_name", "team_member", "message", "due_date", "status"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) patch[field] = body[field] || null;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("assignment").update(patch).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
