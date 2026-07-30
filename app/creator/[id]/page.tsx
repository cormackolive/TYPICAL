"use client";

import { use, useState } from "react";
import NavBar from "@/components/NavBar";
import { CREATORS } from "@/lib/creators";

const CAMPAIGNS = ["Summer Fitness 2026", "Q2 Wellness Drive", "New Product Launch"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-2)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-editorial)" }}>{children}</div>
    </div>
  );
}

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const creator = CREATORS.find((c) => c.id === id);

  const [tab, setTab] = useState<"overview" | "content" | "audience" | "outreach">("overview");
  const [favorited, setFavorited] = useState(creator?.favorited ?? false);
  const [addedToList, setAddedToList] = useState(false);
  const [shared, setShared] = useState(false);
  const [campaign, setCampaign] = useState("");
  const [assignedCampaign, setAssignedCampaign] = useState<string | null>(null);

  if (!creator) {
    return (
      <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
        <NavBar section="Creator Profile" />
        <div style={{ padding: "80px 40px", textAlign: "center", color: "var(--fg-2)" }}>Creator not found.</div>
      </div>
    );
  }

  function handleAddToList() {
    setAddedToList(true);
    setTimeout(() => setAddedToList(false), 2000);
  }

  function handleShare() {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  function assignToCampaign() {
    if (!campaign) return;
    setAssignedCampaign(campaign);
  }

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Creator Profile" />

      <div style={{ padding: "40px 40px 0" }}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", borderBottom: "var(--border-line)", paddingBottom: 32 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(0,0,0,0.14)", flexShrink: 0 }} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: "-0.01em", color: "var(--typical-orange)" }}>
                {creator.name}
              </div>
              <button
                onClick={() => setFavorited((v) => !v)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
                aria-label="Toggle favorite"
              >
                {favorited ? "★" : "☆"}
              </button>
            </div>
            <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 16 }}>{creator.handle}</div>

            <div style={{ display: "flex", gap: 32, marginBottom: 20, flexWrap: "wrap" }}>
              <Field label="Followers">{creator.followers}</Field>
              <Field label="Engagement">{creator.engagement}%</Field>
              <Field label="Avg. Likes">{creator.avgLikes}</Field>
              <Field label="Posting Freq.">{creator.postingFrequency}</Field>
            </div>

            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)", marginBottom: 8 }}>
                  Platforms
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {creator.platforms.map((p) => (
                    <span key={p} className="tg-pill">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)", marginBottom: 8 }}>
                  Niches
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {creator.niches.map((n) => (
                    <span key={n} className="tg-pill" style={{ color: "var(--typical-orange)" }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="tg-btn tg-btn-done" onClick={handleAddToList}>
              {addedToList ? "Added ✓" : "+ Add to List"}
            </button>
            <button className="tg-btn" onClick={handleShare}>
              {shared ? "Link copied ✓" : "Share"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, borderBottom: "1px solid rgba(17,17,17,0.18)", marginTop: 0 }}>
          {(["overview", "content", "audience", "outreach"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "16px 0",
                background: "none",
                border: "none",
                fontSize: 13,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "var(--typical-ink)" : "var(--fg-2)",
                borderBottom: tab === t ? "2px solid var(--typical-orange)" : "2px solid transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {tab === "overview" && (
            <>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Bio</div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6 }}>{creator.bio}</p>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Contact</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                  <a className="tg-link" href={`mailto:${creator.email}`}>{creator.email}</a>
                  <a className="tg-link" href={`https://${creator.website}`} target="_blank" rel="noreferrer">{creator.website}</a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                  Recent Posts
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ aspectRatio: "1", background: "rgba(0,0,0,0.08)" }} />
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === "content" && <div style={{ color: "var(--fg-2)", fontSize: 14 }}>Content history — coming soon.</div>}
          {tab === "audience" && <div style={{ color: "var(--fg-2)", fontSize: 14 }}>Audience demographics — coming soon.</div>}
          {tab === "outreach" && <div style={{ color: "var(--fg-2)", fontSize: 14 }}>Outreach history — coming soon.</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ border: "var(--border-line)", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)", marginBottom: 12 }}>
              Growth
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last 30 Days</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{creator.growth30}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last 90 Days</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{creator.growth90}</div>
              </div>
            </div>
          </div>

          <div style={{ border: "var(--border-line)", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)", marginBottom: 12 }}>
              Outreach
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="/dms" className="tg-btn" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
                💬 Send DM
              </a>
              <a href="/emails" className="tg-btn" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
                📧 Send Email
              </a>
            </div>
          </div>

          <div style={{ border: "var(--border-line)", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)", marginBottom: 12 }}>
              Assign
            </div>
            <select className="tg-select" style={{ width: "100%", marginBottom: 8 }} value={campaign} onChange={(e) => setCampaign(e.target.value)}>
              <option value="">Select campaign…</option>
              {CAMPAIGNS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="tg-btn tg-btn-done" style={{ width: "100%" }} onClick={assignToCampaign}>
              Assign to Campaign
            </button>
            {assignedCampaign && (
              <div style={{ fontSize: 12, color: "var(--typical-orange)", marginTop: 8, fontWeight: 600 }}>
                ✓ Assigned to {assignedCampaign}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
