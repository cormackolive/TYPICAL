"use client";

import { useMemo, useState } from "react";
import type { AssignmentDb } from "@/lib/types";

const STATUS_SWATCH: Record<AssignmentDb["status"], string> = {
  Pending: "#FBE9F1",
  "In progress": "#EFC988",
  Complete: "#DDE2C0",
};

const TEAM_MEMBERS = ["Sarah", "Alex", "Jordan"] as const;

const EMPTY_DRAFT = { influencer_name: "", team_member: "", message: "", due_date: "" };

export default function AssignedTable({ initialAssignments }: { initialAssignments: AssignmentDb[] }) {
  const [assignments, setAssignments] = useState<AssignmentDb[]>(initialAssignments);
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(
    () => (memberFilter === "all" ? assignments : assignments.filter((a) => a.team_member === memberFilter)),
    [assignments, memberFilter]
  );

  async function patchAssignment(id: string, patch: Partial<AssignmentDb>) {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    await fetch(`/api/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const created = await res.json();
      setAssignments((prev) => [created, ...prev]);
      setDraft(EMPTY_DRAFT);
    }
    setAdding(false);
  }

  const cellInputStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    font: "inherit",
    color: "inherit",
    width: "100%",
    padding: 0,
  };

  return (
    <>
      <div style={{ padding: "24px 40px 0" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 6 }}>
          Filter by team member
        </div>
        <select
          className="tg-select"
          style={{ width: 240 }}
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
        >
          <option value="all">All assignments</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div style={{ padding: "24px 40px 12px" }}>
        <form
          onSubmit={addAssignment}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr 160px auto",
            gap: 10,
            alignItems: "center",
            border: "var(--border-hair)",
            padding: 12,
          }}
        >
          <input
            className="tg-input"
            placeholder="Influencer name"
            value={draft.influencer_name}
            onChange={(e) => setDraft((d) => ({ ...d, influencer_name: e.target.value }))}
          />
          <input
            className="tg-input"
            placeholder="Team member"
            value={draft.team_member}
            onChange={(e) => setDraft((d) => ({ ...d, team_member: e.target.value }))}
          />
          <input
            className="tg-input"
            placeholder="e.g. Follow up on delivery — no response since shipment."
            value={draft.message}
            onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
          />
          <input
            className="tg-input"
            type="date"
            value={draft.due_date}
            onChange={(e) => setDraft((d) => ({ ...d, due_date: e.target.value }))}
          />
          <button type="submit" className="tg-btn tg-btn-done" disabled={adding}>
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      <div style={{ padding: "0 40px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--fg-2)", fontSize: 16 }}>
            No assignments at the moment.
          </div>
        ) : (
          <div style={{ border: "var(--border-hair)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--bg-1)", borderBottom: "1px solid rgba(17,17,17,0.18)" }}>
                  {["Influencer", "Team member", "Message", "Due date", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: 12,
                        fontSize: 12,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--fg-2)",
                        fontWeight: 600,
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: "1px solid rgba(17,17,17,0.18)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(241, 90, 41, 0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 12px", fontWeight: 600 }}>
                      <input
                        style={cellInputStyle}
                        defaultValue={a.influencer_name ?? ""}
                        placeholder="Influencer name"
                        onBlur={(e) => patchAssignment(a.id, { influencer_name: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <input
                        style={cellInputStyle}
                        defaultValue={a.team_member ?? ""}
                        placeholder="Team member"
                        onBlur={(e) => patchAssignment(a.id, { team_member: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--fg-2)" }}>
                      <input
                        style={cellInputStyle}
                        defaultValue={a.message ?? ""}
                        placeholder="e.g. DM'd again, no reply yet"
                        onBlur={(e) => patchAssignment(a.id, { message: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <input
                        type="date"
                        style={cellInputStyle}
                        defaultValue={a.due_date ?? ""}
                        onBlur={(e) => patchAssignment(a.id, { due_date: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <select
                        value={a.status}
                        onChange={(e) => patchAssignment(a.id, { status: e.target.value as AssignmentDb["status"] })}
                        style={{
                          border: "1px solid rgba(0,0,0,0.15)",
                          borderRadius: 4,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          background: STATUS_SWATCH[a.status],
                          color: "var(--typical-ink)",
                        }}
                      >
                        {(Object.keys(STATUS_SWATCH) as AssignmentDb["status"][]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
