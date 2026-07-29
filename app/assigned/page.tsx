"use client";

import { useMemo, useState } from "react";
import NavBar from "@/components/NavBar";

type AssignmentStatus = "Pending" | "In progress" | "Complete";

interface Assignment {
  id: string;
  influencerId: string;
  influencerName: string;
  teamMember: "Sarah" | "Alex" | "Jordan";
  message: string;
  dueDate: string;
  status: AssignmentStatus;
}

// Mock data — not yet wired to a real assignments table/API.
const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    influencerId: "sample-1",
    influencerName: "Jordan Diaz",
    teamMember: "Sarah",
    message: "Follow up on delivery — no response since shipment.",
    dueDate: "2026-08-02",
    status: "Pending",
  },
  {
    id: "2",
    influencerId: "sample-2",
    influencerName: "Maya Chen",
    teamMember: "Alex",
    message: "Confirm story link once posted.",
    dueDate: "2026-08-04",
    status: "In progress",
  },
  {
    id: "3",
    influencerId: "sample-3",
    influencerName: "Priya Nair",
    teamMember: "Jordan",
    message: "Send thank-you note after IG post.",
    dueDate: "2026-07-30",
    status: "Complete",
  },
];

const STATUS_SWATCH: Record<AssignmentStatus, string> = {
  Pending: "#EFA8C4",
  "In progress": "#EFC988",
  Complete: "#DDE2C0",
};

const TEAM_MEMBERS = ["Sarah", "Alex", "Jordan"] as const;

export default function AssignedPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [memberFilter, setMemberFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (memberFilter === "all" ? assignments : assignments.filter((a) => a.teamMember === memberFilter)),
    [assignments, memberFilter]
  );

  function markDone(id: string) {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Complete" } : a)));
  }

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Assigned" />

      <div style={{ padding: "48px 40px 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.01em", marginBottom: 8 }}>
          Assigned
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Follow-ups and tasks assigned to the team.</div>
      </div>

      <div style={{ padding: "0 40px 24px" }}>
        <select
          className="tg-select"
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

      <div style={{ padding: "0 40px 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--fg-2)", fontFamily: "var(--font-editorial)", fontSize: 22 }}>
            No assignments at the moment.
          </div>
        ) : (
          <div style={{ border: "var(--border-line)", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "var(--border-line)", textAlign: "left" }}>
                  {["Influencer", "Team member", "Message", "Due date", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--fg-2)",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "var(--border-hair)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <a href={`/tracker?influencer=${a.influencerId}`} className="tg-link">
                        {a.influencerName}
                      </a>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{a.teamMember}</td>
                    <td style={{ padding: "12px 14px", color: "var(--fg-2)" }}>{a.message}</td>
                    <td style={{ padding: "12px 14px" }}>{a.dueDate}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        className="tg-pill"
                        style={{ background: STATUS_SWATCH[a.status], border: "1px solid rgba(0,0,0,0.15)" }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {a.status === "Pending" && (
                        <button className="tg-btn" onClick={() => markDone(a.id)}>
                          Mark done
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
