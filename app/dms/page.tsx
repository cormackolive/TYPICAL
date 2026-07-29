import NavBar from "@/components/NavBar";

export default function DmsPage() {
  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="DMs" />
      <div style={{ padding: "80px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-editorial)", fontSize: 28, marginBottom: 8 }}>DMs</div>
        <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Coming soon.</div>
      </div>
    </div>
  );
}
