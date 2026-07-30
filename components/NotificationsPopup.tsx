"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "typical-notifications-preference";

export default function NotificationsPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === null) setVisible(true);
  }, []);

  function respond(enabled: boolean) {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "white",
          border: "2px solid var(--typical-black)",
          borderRadius: 4,
          padding: 32,
          maxWidth: 420,
          width: "calc(100% - 40px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          pointerEvents: "auto",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "-0.01em", margin: "0 0 12px 0" }}>
          Enable Notifications?
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 28px 0" }}>
          Get alerts when you&apos;re assigned a response and one day before the due date.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: 12,
              borderRadius: 4,
              border: "2px solid var(--typical-black)",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              background: "white",
              color: "var(--fg-1)",
            }}
            onClick={() => respond(false)}
          >
            No, thanks
          </button>
          <button
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: 12,
              borderRadius: 4,
              border: "2px solid var(--typical-black)",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              background: "var(--typical-orange)",
              color: "white",
            }}
            onClick={() => respond(true)}
          >
            Yes, enable
          </button>
        </div>
      </div>
    </div>
  );
}
