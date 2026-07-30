"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import SendPrModal from "@/components/SendPrModal";
import type { AssignmentDb } from "@/lib/types";

interface EmailThread {
  id: string;
  from: string;
  subject: string;
  senderName: string;
  time: string;
  body: string[];
  aiSuggestion: string;
}

// Mock data — real email requires its own Gmail API / OAuth app, not yet set up.
const THREADS: EmailThread[] = [
  {
    id: "1",
    from: "emma.w@email.com",
    senderName: "Emma Wilson",
    subject: "Partnership inquiry for UGC content",
    time: "Yesterday, 2:30 PM",
    body: [
      "Hi there,",
      "We'd love to explore a partnership with your brand. Are you open to UGC content creation or product seeding?",
      "Looking forward to hearing from you.",
    ],
    aiSuggestion: "Thanks for reaching out! We're excited about collaboration.",
  },
  {
    id: "2",
    from: "marcus.j@creators.com",
    senderName: "Marcus J.",
    subject: "Product collaboration question",
    time: "2 days ago",
    body: ["Hi, I'd love to learn more about collaborating on a product feature. Let me know what info you need from me."],
    aiSuggestion: "Hi Marcus, happy to share more details — here's what we'd need to get started.",
  },
  {
    id: "3",
    from: "agency@brandpartners.io",
    senderName: "Brand Partners Agency",
    subject: "UGC content opportunity",
    time: "5 days ago",
    body: ["We represent a roster of creators interested in working with home/lifestyle brands like yours. Open to a call?"],
    aiSuggestion: "Thanks for the note — happy to hop on a call. What times work for you?",
  },
];

const META_COLOR = "rgba(17,17,17,0.62)";

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 56,
        height: 32,
        borderRadius: 999,
        border: "2px solid var(--typical-black)",
        background: on ? "var(--typical-orange)" : "white",
        position: "relative",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 26 : 2,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: on ? "white" : "var(--typical-black)",
          transition: "left 150ms ease",
        }}
      />
    </button>
  );
}

export default function EmailsPage() {
  const [tab, setTab] = useState<"messages" | "automation">("messages");
  const [selectedId, setSelectedId] = useState(THREADS[0].id);
  const [assignee, setAssignee] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignConfirmed, setAssignConfirmed] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [reply, setReply] = useState("");
  const [showSendPr, setShowSendPr] = useState(false);
  const [automationOn, setAutomationOn] = useState(false);
  const [subjectTrigger, setSubjectTrigger] = useState("");
  const [template, setTemplate] = useState("");
  const [savedRule, setSavedRule] = useState(false);

  // Same team-member list as Task Manager (/assigned) — built from whatever
  // names have actually been used there, not a fixed list.
  useEffect(() => {
    fetch("/api/assignments")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: AssignmentDb[]) => {
        const names = new Set<string>();
        data.forEach((a) => {
          if (a.team_member) names.add(a.team_member);
        });
        setTeamMembers(Array.from(names).sort());
      });
  }, []);

  const selected = THREADS.find((t) => t.id === selectedId)!;

  useEffect(() => {
    setAssignee("");
    setAssignConfirmed(false);
  }, [selectedId]);

  function useAiSuggestion() {
    setReply(selected.aiSuggestion);
  }

  function saveRule() {
    setSavedRule(true);
    setTimeout(() => setSavedRule(false), 2000);
  }

  // Creates a real Task Manager entry — same table/API as the /assigned page.
  async function assignToTeam(member: string) {
    setAssignee(member);
    setAssignConfirmed(false);
    setAssignError("");
    if (!member) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencer_name: selected.senderName,
          team_member: member,
          message: `Follow up on email: "${selected.subject}"`,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
        setAssignError(error ?? `Request failed (${res.status})`);
        return;
      }
      setTeamMembers((prev) => (prev.includes(member) ? prev : [...prev, member].sort()));
      setAssignConfirmed(true);
    } catch {
      setAssignError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Email" />

      <div style={{ padding: "40px 48px 80px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: "-0.01em", marginBottom: 24 }}>
          Email <span style={{ color: "var(--typical-orange)", fontSize: 18 }}>— MOCKUP ONLY</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "2px solid rgba(17,17,17,0.12)" }}>
          {(["messages", "automation"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                padding: "12px 20px",
                border: "none",
                background: "transparent",
                borderBottom: tab === t ? "3px solid var(--typical-orange)" : "3px solid transparent",
                marginBottom: -2,
                color: tab === t ? "var(--fg-1)" : META_COLOR,
                cursor: "pointer",
                fontWeight: tab === t ? 700 : 500,
              }}
            >
              {t === "messages" ? "Messages" : "Automation"}
            </button>
          ))}
        </div>

        {tab === "messages" ? (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, alignItems: "start" }}>
            <div style={{ border: "2px solid var(--typical-black)", borderRadius: 8, overflow: "hidden", background: "white" }}>
              <div style={{ padding: "16px 20px", borderBottom: "2px solid var(--typical-black)" }}>
                <h2 style={{ fontSize: 15, margin: 0, fontWeight: 700 }}>Inbox</h2>
              </div>
              <div style={{ maxHeight: 560, overflowY: "auto" }}>
                {THREADS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "18px 20px",
                      borderBottom: "1px solid rgba(17,17,17,0.1)",
                      borderLeft: t.id === selectedId ? "4px solid var(--typical-orange)" : "4px solid transparent",
                      background: t.id === selectedId ? "rgba(241, 90, 41, 0.08)" : "transparent",
                      cursor: "pointer",
                      font: "inherit",
                      color: "inherit",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{t.from}</div>
                    <div style={{ fontSize: 13.5, color: "var(--fg-1)", lineHeight: 1.4, marginBottom: 8 }}>{t.subject}</div>
                    <div style={{ fontSize: 12.5, color: META_COLOR }}>{t.time}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <select
                  value={assignee}
                  onChange={(e) => assignToTeam(e.target.value)}
                  disabled={assigning}
                  style={{
                    fontSize: 15,
                    padding: "14px 16px",
                    border: "2px solid var(--typical-black)",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  <option value="">Assign to team…</option>
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowSendPr(true)}
                  style={{
                    fontSize: 15,
                    padding: "14px 16px",
                    border: "none",
                    background: "var(--typical-black)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <svg viewBox="0 0 200 200" style={{ width: 20, height: 20, stroke: "white", strokeWidth: 12, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }}>
                    <path d="M 75 70 Q 50 50 40 40 Q 30 30 40 20 Q 50 10 70 30 Q 100 50 100 50 Q 100 50 130 30 Q 150 10 160 20 Q 170 30 160 40 Q 150 50 125 70" />
                    <rect x="40" y="75" width="120" height="90" rx="5" />
                    <line x1="100" y1="75" x2="100" y2="165" />
                    <line x1="40" y1="110" x2="160" y2="110" />
                  </svg>
                  Send PR
                </button>
              </div>

              {(assignConfirmed || assignError) && (
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: assignError ? "var(--typical-orange)" : "var(--fg-1)",
                    marginTop: -8,
                    marginBottom: 20,
                  }}
                >
                  {assignError || `✓ Added to ${assignee}'s Task Manager list`}
                </div>
              )}

              <div style={{ border: "2px solid var(--typical-black)", borderRadius: 8, background: "white", overflow: "hidden" }}>
                <div style={{ padding: 24, borderBottom: "1px solid rgba(17,17,17,0.12)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selected.subject}</h3>
                    <div style={{ fontSize: 13, color: META_COLOR, whiteSpace: "nowrap" }}>{selected.time}</div>
                  </div>
                  <div style={{ fontSize: 14, color: META_COLOR, marginTop: 4 }}>
                    {selected.senderName} · {selected.from}
                  </div>
                </div>

                <div style={{ padding: 24, borderBottom: "1px solid rgba(17,17,17,0.12)" }}>
                  {selected.body.map((p, i) => (
                    <p key={i} style={{ margin: i === selected.body.length - 1 ? 0 : "0 0 16px 0", fontSize: 16, lineHeight: 1.7 }}>
                      {p}
                    </p>
                  ))}
                </div>

                <div style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 14,
                      background: "rgba(241, 90, 41, 0.07)",
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ flex: 1, fontSize: 14.5, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>AI suggestion:</span> {selected.aiSuggestion}
                    </div>
                    <button
                      onClick={useAiSuggestion}
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--typical-orange)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        padding: 0,
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      Use this
                    </button>
                  </div>

                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply…"
                    style={{
                      width: "100%",
                      minHeight: 120,
                      fontSize: 15,
                      padding: 16,
                      border: "2px solid rgba(17,17,17,0.18)",
                      borderRadius: 8,
                      resize: "vertical",
                      boxSizing: "border-box",
                      marginBottom: 16,
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    style={{
                      width: "100%",
                      fontSize: 16,
                      padding: 16,
                      border: "none",
                      background: "var(--typical-orange)",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                      borderRadius: 8,
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 640 }}>
            <div style={{ border: "2px solid var(--typical-black)", borderRadius: 8, background: "white", overflow: "hidden" }}>
              <div style={{ padding: 24, borderBottom: "1px solid rgba(17,17,17,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Auto-reply to emails</div>
                  <div style={{ fontSize: 14, color: META_COLOR }}>Sends your template the moment a subject matches.</div>
                </div>
                <ToggleSwitch on={automationOn} onChange={setAutomationOn} />
              </div>

              <div style={{ padding: 24, borderBottom: "1px solid rgba(17,17,17,0.12)" }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Trigger: subject contains</label>
                <input
                  type="text"
                  placeholder="e.g. partnership"
                  value={subjectTrigger}
                  onChange={(e) => setSubjectTrigger(e.target.value)}
                  style={{
                    width: "100%",
                    fontSize: 15,
                    padding: "14px 16px",
                    border: "2px solid rgba(17,17,17,0.18)",
                    borderRadius: 8,
                    boxSizing: "border-box",
                    marginBottom: 20,
                  }}
                />
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Response template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  style={{
                    width: "100%",
                    fontSize: 15,
                    padding: "14px 16px",
                    border: "2px solid rgba(17,17,17,0.18)",
                    background: "white",
                    borderRadius: 8,
                  }}
                >
                  <option value="">Select template…</option>
                  <option>Initial outreach</option>
                  <option>After selection</option>
                  <option>Follow-up</option>
                </select>
              </div>

              <div style={{ padding: 24 }}>
                <button
                  onClick={saveRule}
                  style={{
                    width: "100%",
                    fontSize: 16,
                    padding: 16,
                    border: "none",
                    background: "var(--typical-black)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                    borderRadius: 8,
                  }}
                >
                  {savedRule ? "Saved ✓" : "Save rule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSendPr && <SendPrModal onClose={() => setShowSendPr(false)} />}
    </div>
  );
}
