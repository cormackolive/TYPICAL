import NavBar from "@/components/NavBar";

export default function EmailsPage() {
  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Email" />
      <div style={{ padding: "120px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, marginBottom: 12 }}>Coming soon</div>
        <div style={{ fontSize: 16, color: "var(--fg-2)" }}>We&apos;re building the email inbox. Check back soon.</div>
      </div>
    </div>
  );
}
