import { createAdminClient } from "@/lib/supabase/admin";
import NavBar from "@/components/NavBar";
import AssignedTable from "@/components/AssignedTable";
import type { AssignmentDb } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AssignedPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("assignment").select("*").order("created_at", { ascending: false });

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Assigned" />

      <div style={{ padding: "48px 40px 8px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 12 }}>
          Assigned
        </div>
        <div style={{ fontSize: 16, color: "var(--fg-2)" }}>
          Review tasks and follow-ups assigned to you. Mark as complete when done.
        </div>
      </div>

      <AssignedTable initialAssignments={(data ?? []) as AssignmentDb[]} />
    </div>
  );
}
