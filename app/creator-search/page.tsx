"use client";

import { useMemo, useState } from "react";
import NavBar from "@/components/NavBar";
import { CREATORS, type AgeRange, type Gender } from "@/lib/creators";

type SortBy = "relevance" | "followers" | "engagement" | "recent";
type ViewMode = "grid" | "list";

function parseCount(value: string): number {
  const n = parseFloat(value);
  if (value.toUpperCase().includes("K")) return n * 1_000;
  if (value.toUpperCase().includes("M")) return n * 1_000_000;
  return n;
}

function uniqueSorted<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values)).sort();
}

const EMPTY_FILTERS = {
  gender: "" as Gender | "",
  interest: "",
  age: "" as AgeRange | "",
  state: "",
  audienceGender: "" as Gender | "",
  audienceInterest: "",
  audienceAge: "" as AgeRange | "",
  audienceCountry: "",
  audienceState: "",
};

export default function CreatorSearchPage() {
  const [vibeQuery, setVibeQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
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

  function setFilter<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const options = useMemo(
    () => ({
      genders: uniqueSorted(CREATORS.map((c) => c.gender)),
      interests: uniqueSorted(CREATORS.flatMap((c) => c.niches)),
      ages: uniqueSorted(CREATORS.map((c) => c.ageRange)),
      states: uniqueSorted(CREATORS.map((c) => c.state)),
      audienceGenders: uniqueSorted(CREATORS.map((c) => c.audience.gender)),
      audienceCountries: uniqueSorted(CREATORS.map((c) => c.audience.country)),
      audienceStates: uniqueSorted(CREATORS.map((c) => c.audience.state)),
    }),
    []
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const results = useMemo(() => {
    const q = vibeQuery.trim().toLowerCase();
    let filtered = CREATORS.filter((c) => {
      if (q) {
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.niches.some((n) => n.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      if (filters.gender && c.gender !== filters.gender) return false;
      if (filters.interest && !c.niches.includes(filters.interest)) return false;
      if (filters.age && c.ageRange !== filters.age) return false;
      if (filters.state && c.state !== filters.state) return false;
      if (filters.audienceGender && c.audience.gender !== filters.audienceGender) return false;
      if (filters.audienceInterest && !c.niches.includes(filters.audienceInterest)) return false;
      if (filters.audienceAge && c.audience.ageRange !== filters.audienceAge) return false;
      if (filters.audienceCountry && c.audience.country !== filters.audienceCountry) return false;
      if (filters.audienceState && c.audience.state !== filters.audienceState) return false;
      return true;
    });

    if (sortBy === "followers") {
      filtered = filtered.slice().sort((a, b) => parseCount(b.followers) - parseCount(a.followers));
    } else if (sortBy === "engagement") {
      filtered = filtered.slice().sort((a, b) => parseFloat(b.engagement) - parseFloat(a.engagement));
    }
    // "recent" and "relevance" both fall back to the original mock order.

    return filtered;
  }, [vibeQuery, filters, sortBy]);

  const interestedCount = favorites.size;

  const selectStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    border: "var(--border-hair)",
    background: "var(--bg-1)",
    color: "var(--fg-1)",
    padding: "8px 10px",
  };

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Creator Search" />

      <div style={{ padding: "48px 40px 8px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.01em", marginBottom: 8 }}>
          Creator Marketplace <span style={{ color: "var(--typical-orange)" }}>— MOCKUP ONLY</span>
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
        {/* Vibe Prospecting: today this just does a plain keyword match against
            name/bio/niches. The plan is to send this text to Claude to turn a loose
            description into structured filters — that part isn't wired up yet. */}
        <div style={{ border: "2px solid var(--typical-black)", padding: 16, marginBottom: 24, background: "var(--bg-1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "-0.01em" }}>Vibe Prospecting</div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--typical-orange)",
                border: "1px solid var(--typical-orange)",
                padding: "2px 8px",
              }}
            >
              Coming soon: AI-powered
            </span>
          </div>
          <input
            className="tg-input"
            type="text"
            placeholder="Describe the vibe — e.g. “high-energy fitness creators with young audiences”"
            value={vibeQuery}
            onChange={(e) => setVibeQuery(e.target.value)}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 8 }}>
            For now this matches your text against creator names, bios, and niches. Eventually it&apos;ll use Claude to
            turn a loose description like this into real filters automatically.
          </div>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-2)" }}>
                Filter results
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--typical-orange)", padding: 0 }}
                >
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>

            <div style={{ border: "var(--border-hair)", padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Creator</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "var(--border-hair)", paddingTop: 10 }}>
                <select style={selectStyle} value={filters.gender} onChange={(e) => setFilter("gender", e.target.value as Gender | "")}>
                  <option value="">Gender: Any</option>
                  {options.genders.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.interest} onChange={(e) => setFilter("interest", e.target.value)}>
                  <option value="">Interests: Any</option>
                  {options.interests.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.age} onChange={(e) => setFilter("age", e.target.value as AgeRange | "")}>
                  <option value="">Age: Any</option>
                  {options.ages.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.state} onChange={(e) => setFilter("state", e.target.value)}>
                  <option value="">State: Any</option>
                  {options.states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ border: "var(--border-hair)", padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Audience</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "var(--border-hair)", paddingTop: 10 }}>
                <select style={selectStyle} value={filters.audienceGender} onChange={(e) => setFilter("audienceGender", e.target.value as Gender | "")}>
                  <option value="">Gender: Any</option>
                  {options.audienceGenders.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.audienceInterest} onChange={(e) => setFilter("audienceInterest", e.target.value)}>
                  <option value="">Interests: Any</option>
                  {options.interests.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.audienceAge} onChange={(e) => setFilter("audienceAge", e.target.value as AgeRange | "")}>
                  <option value="">Age: Any</option>
                  {options.ages.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.audienceCountry} onChange={(e) => setFilter("audienceCountry", e.target.value)}>
                  <option value="">Country: Any</option>
                  {options.audienceCountries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select style={selectStyle} value={filters.audienceState} onChange={(e) => setFilter("audienceState", e.target.value)}>
                  <option value="">State: Any</option>
                  {options.audienceStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--fg-2)", fontFamily: "var(--font-editorial)", fontSize: 22 }}>
              No creators match those filters.
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
