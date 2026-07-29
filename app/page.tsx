import NavBar from "@/components/NavBar";

const SECTIONS = [
  {
    href: "/tracker",
    icon: "Track",
    title: "Influencer Tracker",
    desc: "Track gifting orders end-to-end — shipped, in transit, delivered, and posted.",
  },
  {
    href: "/assigned",
    icon: "Assign",
    title: "Assigned",
    desc: "Review tasks and follow-ups assigned across the team, and mark them done.",
  },
  {
    href: "/analytics",
    icon: "Analyze",
    title: "Analytics",
    desc: "Campaign performance: PR spend, content status, and influencer growth.",
  },
  {
    href: "/dms",
    icon: "DMs",
    title: "Messages",
    desc: "Direct message inbox — coming soon.",
  },
  {
    href: "/emails",
    icon: "Email",
    title: "Email",
    desc: "Email inbox — coming soon.",
  },
];

const DOT_POSITIONS: React.CSSProperties[] = [
  // Row 1 (top)
  { top: "2%", left: "8%" },
  { top: "2%", left: "38%" },
  { top: "2%", right: "15%" },
  // Row 2
  { top: "26%", left: "22%" },
  { top: "26%", right: "8%" },
  // Row 3 (middle)
  { bottom: "48%", left: "8%" },
  { bottom: "48%", left: "38%" },
  { bottom: "48%", right: "15%" },
  // Row 4
  { bottom: "24%", left: "22%" },
  { bottom: "24%", right: "8%" },
  // Row 5 (bottom)
  { bottom: "2%", left: "8%" },
  { bottom: "2%", left: "38%" },
  { bottom: "2%", right: "15%" },
];

function PolkaDots() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden>
      {DOT_POSITIONS.map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(61, 50, 38, 0.6)",
            ...pos,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <PolkaDots />

      {/* Sits above the fixed polka-dot layer via its own stacking context. */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <NavBar section="Home" />

        <div style={{ padding: "60px 40px 40px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 48, lineHeight: 1.1, marginBottom: 16 }}>PR Hub</div>
          <div style={{ fontSize: 16, color: "var(--fg-2)", maxWidth: 600 }}>
            Manage relationships, track orders, respond to assignments, and monitor performance in one place.
          </div>
        </div>

        <div style={{ padding: "0 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="tg-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  border: "2px solid var(--typical-black)",
                  background: "var(--bg-1)",
                  padding: 24,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--typical-orange)" }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--typical-ink)" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.5 }}>{s.desc}</div>
                <div
                  style={{
                    marginTop: "auto",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--typical-orange)",
                  }}
                >
                  View →
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
