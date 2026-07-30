"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import SendPrModal from "@/components/SendPrModal";
import type { AssignmentDb } from "@/lib/types";

interface Thread {
  id: string;
  name: string;
  handle: string;
  followers: string;
  preview: string;
  body: string;
  time: string;
  aiSuggestion: string;
}

// Mock data — real Instagram DMs require a Meta Developer app with Instagram
// Messaging permissions (app review + business verification), not yet set up.
const THREADS: Thread[] = [
  {
    id: "1",
    name: "Sarah Chen",
    handle: "@sarahchen",
    followers: "15.2K",
    preview: "Your stretch towels look amazing. Would love to collaborate!",
    body: "Your stretch towels look amazing. Would love to collaborate!",
    time: "2h ago",
    aiSuggestion: "Hey Sarah! We'd love to collaborate too. Let me send you some product details and options.",
  },
  {
    id: "2",
    name: "Emma Wilson",
    handle: "@emmawilson",
    followers: "8.4K",
    preview: "Partnership inquiry for UGC content",
    body: "Hi! I run a lifestyle account and would love to talk about a UGC partnership for your towels.",
    time: "Yesterday",
    aiSuggestion: "Hi Emma, thanks for reaching out! We'd love to hear more about your UGC ideas.",
  },
  {
    id: "3",
    name: "Marcus Johnson",
    handle: "@marcusjohnson",
    followers: "5.8K",
    preview: "Can you send info about partnership rates?",
    body: "Can you send info about partnership rates?",
    time: "3 days ago",
    aiSuggestion: "Hi Marcus! We typically do product gifting rather than paid rates — happy to send more details.",
  },
];

export default function DmsPage() {
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
  const [keyword, setKeyword] = useState("");
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
          influencer_name: selected.name,
          team_member: member,
          message: `Follow up on Instagram DM: "${selected.preview}"`,
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
    <div className="typical" style={{ minHeight: "100vh", background: "#FEFBF8", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Messages" />

      <div style={{ padding: "40px 48px 80px" }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--fg-2)", marginBottom: 32 }}>
          {(["messages", "automation"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "12px 16px",
                border: "none",
                background: "transparent",
                borderBottom: tab === t ? "2px solid var(--typical-orange)" : "2px solid transparent",
                color: tab === t ? "var(--fg-1)" : "var(--fg-2)",
                cursor: "pointer",
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t === "messages" ? "Messages" : "Automation"}
            </button>
          ))}
        </div>

        {tab === "messages" ? (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, minHeight: 600 }}>
            <div style={{ border: "2px solid var(--typical-black)", borderRadius: 4, overflow: "hidden", background: "white", height: "fit-content" }}>
              <div style={{ padding: 16, borderBottom: "2px solid var(--typical-black)", background: "#FEFBF8" }}>
                <h2 style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", margin: 0, fontWeight: 700 }}>
                  Direct Messages
                </h2>
              </div>
              <div style={{ maxHeight: 500, overflowY: "auto" }}>
                {THREADS.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    style={{
                      padding: t.id === selectedId ? "14px 16px 14px 13px" : "14px 16px",
                      borderBottom: "1px solid var(--fg-2)",
                      borderLeft: t.id === selectedId ? "3px solid var(--typical-orange)" : "none",
                      background: t.id === selectedId ? "#FEE9DC" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--typical-orange)", marginBottom: 6 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-1)", lineHeight: 1.4, marginBottom: 8 }}>{t.preview}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-2)" }}>{t.time} • {t.followers}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ marginBottom: 16 }}>
                <select
                  value={assignee}
                  onChange={(e) => assignToTeam(e.target.value)}
                  disabled={assigning}
                  style={{ width: "100%", fontSize: 12, padding: 12, border: "2px solid var(--typical-black)", background: "white", cursor: "pointer", fontWeight: 600, borderRadius: 4 }}
                >
                  <option value="">Assign to team</option>
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {assignConfirmed && (
                  <div style={{ fontSize: 12, color: "var(--typical-orange)", marginTop: 6, fontWeight: 600 }}>
                    ✓ Added to {assignee}&apos;s Task Manager list
                  </div>
                )}
                {assignError && (
                  <div style={{ fontSize: 12, color: "var(--typical-orange)", marginTop: 6 }}>{assignError}</div>
                )}
              </div>

              <div style={{ padding: 20, border: "2px solid var(--typical-black)", borderBottom: "none", borderRadius: "4px 4px 0 0", background: "#FEFBF8" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px 0", color: "var(--typical-orange)" }}>{selected.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--fg-2)" }}>{selected.handle} • {selected.followers} followers</div>
                  <div style={{ fontSize: 11, color: "var(--fg-2)" }}>{selected.time}</div>
                </div>
              </div>

              <div style={{ padding: 24, border: "2px solid var(--typical-black)", borderTop: "1px solid var(--fg-2)", background: "white" }}>
                <div style={{ padding: 14, background: "white", border: "1px solid var(--fg-2)", borderRadius: 6, fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>
                  {selected.body}
                </div>
              </div>

              <div style={{ padding: 20, border: "2px solid var(--typical-black)", borderRadius: 4, background: "white", margin: "16px 0" }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 16, fontWeight: 700 }}>
                  Quick reply
                </label>
                <div style={{ marginBottom: 16, padding: 12, background: "rgba(241, 90, 41, 0.08)", borderRadius: 4, borderLeft: "3px solid var(--typical-orange)" }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>💡 {selected.aiSuggestion}</div>
                </div>
                <button
                  onClick={useAiSuggestion}
                  style={{ width: "100%", fontSize: 12, padding: 10, border: "2px solid var(--typical-black)", background: "transparent", cursor: "pointer", fontWeight: 600, marginBottom: 16, borderRadius: 4 }}
                >
                  Use AI suggestion
                </button>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type message…"
                  style={{ width: "100%", minHeight: 90, fontSize: 13, padding: 12, border: "1px solid var(--fg-2)", resize: "vertical", borderRadius: 4, boxSizing: "border-box" }}
                />
                <button
                  style={{ width: "100%", fontSize: 13, padding: 13, border: "none", background: "var(--typical-orange)", color: "white", cursor: "pointer", fontWeight: 700, borderRadius: 4, letterSpacing: "0.03em", marginTop: 16 }}
                >
                  Send Message
                </button>
              </div>

              <button
                onClick={() => setShowSendPr(true)}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  padding: 16,
                  border: "2px solid var(--typical-black)",
                  background: "white",
                  color: "var(--typical-orange)",
                  cursor: "pointer",
                  fontWeight: 700,
                  borderRadius: 4,
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <svg viewBox="0 0 200 200" style={{ width: 24, height: 24, stroke: "var(--typical-orange)", strokeWidth: 12, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M 75 70 Q 50 50 40 40 Q 30 30 40 20 Q 50 10 70 30 Q 100 50 100 50 Q 100 50 130 30 Q 150 10 160 20 Q 170 30 160 40 Q 150 50 125 70" />
                  <rect x="40" y="75" width="120" height="90" rx="5" />
                  <line x1="100" y1="75" x2="100" y2="165" />
                  <line x1="40" y1="110" x2="160" y2="110" />
                </svg>
                Send PR
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 20px 0" }}>DM Automation</h2>
            <div style={{ border: "2px solid var(--typical-black)", padding: 20, display: "flex", flexDirection: "column", gap: 16, maxWidth: 600, borderRadius: 4, background: "white" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 8, fontWeight: 600 }}>
                  Enable automation
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setAutomationOn(true)}
                    style={{ flex: 1, fontSize: 13, padding: 10, border: "2px solid var(--typical-black)", background: automationOn ? "var(--typical-orange)" : "white", color: automationOn ? "white" : "var(--fg-1)", cursor: "pointer", fontWeight: 600 }}
                  >
                    On
                  </button>
                  <button
                    onClick={() => setAutomationOn(false)}
                    style={{ flex: 1, fontSize: 13, padding: 10, border: !automationOn ? "2px solid var(--typical-black)" : "1px solid var(--fg-2)", background: "white", cursor: "pointer" }}
                  >
                    Off
                  </button>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--fg-2)", paddingTop: 16 }}>
                <label style={{ display: "block", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 8, fontWeight: 600 }}>
                  Trigger: Contains keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'partnership'"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  style={{ width: "100%", fontSize: 14, padding: "10px 12px", border: "1px solid var(--fg-2)", marginBottom: 12, borderRadius: 4, boxSizing: "border-box" }}
                />
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 8, fontWeight: 600 }}>
                  Response template
                </label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  style={{ width: "100%", fontSize: 14, padding: "10px 12px", border: "1px solid var(--fg-2)", background: "white", borderRadius: 4 }}
                >
                  <option value="">Select template…</option>
                  <option>Initial outreach</option>
                  <option>After selection</option>
                  <option>Follow-up</option>
                </select>
              </div>
              <button
                onClick={saveRule}
                style={{ width: "100%", fontSize: 14, padding: 12, border: "2px solid var(--typical-black)", background: "white", cursor: "pointer", fontWeight: 600, borderRadius: 4 }}
              >
                {savedRule ? "Saved ✓" : "Save rule"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showSendPr && <SendPrModal onClose={() => setShowSendPr(false)} />}
    </div>
  );
}
