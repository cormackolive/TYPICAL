"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-1)",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            letterSpacing: "-0.01em",
            marginBottom: 6,
          }}
        >
          TYPICAL
        </div>
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-2)",
            marginBottom: 28,
          }}
        >
          Influencer Gifting — Team Login
        </div>

        {status === "sent" ? (
          <p style={{ fontSize: 14, color: "var(--fg-1)" }}>
            Check <strong>{email}</strong> for a sign-in link. You can close this tab.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              className="tg-input"
              type="email"
              required
              placeholder="you@typical.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }}
            />
            <button
              type="submit"
              className="tg-btn tg-btn-done"
              disabled={status === "sending"}
              style={{ width: "100%" }}
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && (
              <p style={{ fontSize: 13, color: "var(--typical-orange)", marginTop: 10 }}>
                {errorMessage || "Couldn't send link. Ask an admin to invite your email in Supabase."}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
