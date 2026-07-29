"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("checking");
    setErrorMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Couldn't sign in." }));
      setStatus("error");
      setErrorMessage(error ?? "Couldn't sign in.");
      return;
    }

    router.replace("/");
    router.refresh();
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

        <form onSubmit={handleSubmit}>
          <input
            className="tg-input"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }}
          />
          <button
            type="submit"
            className="tg-btn tg-btn-done"
            disabled={status === "checking"}
            style={{ width: "100%" }}
          >
            {status === "checking" ? "Checking…" : "Sign in"}
          </button>
          {status === "error" && (
            <p style={{ fontSize: 13, color: "var(--typical-orange)", marginTop: 10 }}>
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
