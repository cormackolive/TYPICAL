import NavBar from "@/components/NavBar";

const SECTIONS = [
  { href: "/tracker", label: "Track", desc: "Influencer Tracker — gifting orders end-to-end." },
  { href: "/assigned", label: "Assign", desc: "Assigned tasks & follow-ups." },
  { href: "/analytics", label: "Analyze", desc: "Campaign performance dashboard." },
  { href: "/dms", label: "DMs", desc: "Coming soon." },
  { href: "/emails", label: "Email", desc: "Coming soon." },
];

// A decorative dot strip, echoing the "checkerboard of cream polka dots" motif from the design spec.
function DotStrip() {
  return (
    <div
      aria-hidden
      style={{
        height: 56,
        backgroundImage:
          "radial-gradient(circle, rgba(61,50,38,0.6) 7px, transparent 7.5px)",
        backgroundSize: "40px 40px",
        backgroundPosition: "0 0",
      }}
    />
  );
}

export default function HomePage() {
  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Home" />
      <DotStrip />

      <div style={{ padding: "48px 40px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: "-0.01em", marginBottom: 10 }}>
          PR Hub
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)", maxWidth: 480, margin: "0 auto" }}>
          Everything the TYPICAL team needs to run influencer gifting, from tracking orders to
          following up on content.
        </div>
      </div>

      <div style={{ padding: "24px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="tg-card"
              style={{
                display: "block",
                border: "2px solid var(--typical-black)",
                background: "var(--bg-1)",
                padding: 24,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: "var(--fg-2)" }}>{s.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <DotStrip />
      </div>
    </div>
  );
}
