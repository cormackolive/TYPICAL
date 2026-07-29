"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar({ section }: { section: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 40px",
        borderBottom: "var(--border-line)",
        background: "var(--bg-1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            letterSpacing: "-0.01em",
            color: "var(--typical-ink)",
            textDecoration: "none",
          }}
        >
          TYPICAL
        </a>
        <span style={{ color: "var(--fg-2)" }}>/</span>
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-2)",
          }}
        >
          {section}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {section !== "Home" && (
          <a
            href="/"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--fg-2)",
              border: "2px solid var(--typical-black)",
              padding: "8px 12px",
              textDecoration: "none",
            }}
          >
            ← Back
          </a>
        )}
        <button className="tg-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </div>
  );
}
