import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EDITABLE_FIELDS = ["notes", "ig_post_link", "tiktok_post_link", "story_posted"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) patch[field] = body[field];
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("influencer").update(patch).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
