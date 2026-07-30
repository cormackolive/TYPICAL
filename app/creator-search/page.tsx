"use client";

import { useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { CREATORS } from "@/lib/creators";

type SortBy = "relevance" | "followers" | "engagement" | "recent";
type ViewMode = "grid" | "list";

function parseCount(value: string): number {
  const n = parseFloat(value);
  if (value.toUpperCase().includes("K")) return n * 1_000;
  if (value.toUpperCase().includes("M")) return n * 1_000_000;
  return n;
}

const FILTER_GROUPS = [
  { title: "Creator", options: ["Gender", "Interests", "Age", "State"] },
  { title: "Audience", options: ["Gender", "Interests", "Age", "Country", "State"] },
];

export default function CreatorSearchPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(CREATORS.filter((c) => c.favorited).map((c) => c.id))
  );

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = CREATORS.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.niches.some((n) => n.toLowerCase().includes(q))
      );
    });

    if (sortBy === "followers") {
      filtered = filtered.slice().sort((a, b) => parseCount(b.followers) - parseCount(a.followers));
    } else if (sortBy === "engagement") {
      filtered = filtered.slice().sort((a, b) => parseFloat(b.engagement) - parseFloat(a.engagement));
    }
    // "recent" and "relevance" both fall back to the original mock order.

    return filtered;
  }, [query, sortBy]);

  const interestedCount = favorites.size;

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Creator Search" />

      <div style={{ padding: "48px 40px 8px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.01em", marginBottom: 8 }}>
          Creator Marketplace
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)" }}>
          Find and connect with creators. Search, filter, and manage your collaborations.
        </div>
      </div>

      <div style={{ padding: "24px 40px 0", borderBottom: "1px solid rgba(17,17,17,0.18)" }}>
        <div style={{ display: "flex", gap: 28 }}>
          {["Search", "Recommendations", "Lists"].map((label) => (
            <div
              key={label}
              style={{
                padding: "0 0 12px",
                fontSize: 13,
                letterSpacing: "0.03em",
                fontWeight: label === "Search" ? 600 : 400,
                color: label === "Search" ? "var(--typical-ink)" : "var(--fg-2)",
                borderBottom: label === "Search" ? "2px solid var(--typical-orange)" : "2px solid transparent",
              }}
            >
              {label}
            </div>
          ))}
          <div style={{ padding: "0 0 12px", fontSize: 13, color: "var(--fg-2)" }}>
            Interested creators <span style={{ marginLeft: 4 }}>{interestedCount}</span>
          </div>
          <div style={{ padding: "0 0 12px", fontSize: 13, color: "var(--fg-2)" }}>Tags and follows</div>
        </div>
      </div>

      <div style={{ padding: "24px 40px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <input
            className="tg-input"
            type="text"
            placeholder="Search by username or keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Find creators to partner with</div>
          <div style={{ display: "flex", gap: 10 }}>
            <select className="tg-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="relevance">Sort by: Relevance</option>
              <option value="followers">Followers (High to Low)</option>
              <option value="engagement">Engagement (High to Low)</option>
              <option value="recent">Recently Added</option>
            </select>
            <button className={`tg-btn${viewMode === "grid" ? " tg-btn-done" : ""}`} onClick={() => setViewMode("grid")}>
              Grid
            </button>
            <button className={`tg-btn${viewMode === "list" ? " tg-btn-done" : ""}`} onClick={() => setViewMode("list")}>
              List
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)" }}>
              Filter search results
            </div>
            {FILTER_GROUPS.map((group) => (
              <div key={group.title} style={{ border: "var(--border-hair)", padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{group.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "var(--border-hair)", paddingTop: 10 }}>
                  {group.options.map((opt) => (
                    <div key={opt} style={{ fontSize: 12, color: "var(--fg-2)" }}>
                      {opt} ▼
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--fg-2)", fontFamily: "var(--font-editorial)", fontSize: 22 }}>
              No creators match that search.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr",
                gap: 16,
              }}
            >
              {results.map((c) => (
                <div key={c.id} className="tg-card" style={{ border: "2px solid var(--typical-black)", padding: 16, background: "var(--bg-1)" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.14)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-editorial)", fontSize: 16, color: "var(--typical-orange)" }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-2)" }}>{c.location}</div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(c.id)}
                      style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 0 }}
                      aria-label="Toggle favorite"
                    >
                      {favorites.has(c.id) ? "★" : "☆"}
                    </button>
                  </div>

                  <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4 }}>{c.bio}</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12, textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Followers</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.followers}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Eng.</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--typical-orange)" }}>{c.engagement}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reach</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.reach}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ aspectRatio: "1", background: "rgba(0,0,0,0.08)" }} />
                    ))}
                  </div>

                  <a
                    href={`/creator/${c.id}`}
                    className="tg-pill"
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      textAlign: "center",
                      padding: "10px",
                      background: "var(--typical-orange)",
                      color: "white",
                      fontSize: 12,
                    }}
                  >
                    View Profile
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
