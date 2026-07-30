"use client";

import { useEffect, useRef, useState } from "react";
import { getNotificationPrefs, setNotificationPrefs } from "@/lib/notifications";

const FIRST_VISIT_KEY = "typical-notifications-first-visit";

type PermissionState = NotificationPermission | "unsupported";

export default function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<PermissionState>("default");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    setSelected(new Set(getNotificationPrefs().members));

    // Auto-open once ever, on whichever page the user happens to be on first.
    if (localStorage.getItem(FIRST_VISIT_KEY) === null) {
      localStorage.setItem(FIRST_VISIT_KEY, "1");
      setOpen(true);
    }

    fetch("/api/assignments")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { team_member: string | null }[]) => {
        const names = Array.from(new Set(rows.map((r) => r.team_member).filter((n): n is string => !!n))).sort();
        setMembers(names);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function toggleMember(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      setNotificationPrefs({ enabled: permission === "granted", members: Array.from(next) });
      return next;
    });
  }

  async function enable() {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    setNotificationPrefs({ enabled: result === "granted", members: Array.from(selected) });
    if (result === "granted") {
      new Notification("TYPICAL notifications enabled", {
        body:
          selected.size > 0
            ? `You'll get alerts for ${Array.from(selected).join(", ")}.`
            : "Pick team members below to get alerts for their tasks.",
      });
    }
  }

  const hasBadge = permission !== "granted" || selected.size === 0;

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          background: "none",
          border: "2px solid var(--typical-black)",
          borderRadius: 4,
          width: 36,
          height: 36,
          cursor: "pointer",
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        🔔
        {hasBadge && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "var(--typical-orange)",
              border: "2px solid var(--bg-1)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 300,
            background: "white",
            border: "2px solid var(--typical-black)",
            borderRadius: 4,
            padding: 20,
            zIndex: 400,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "-0.01em", marginBottom: 8 }}>
            Notifications
          </div>
          <p style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
            Get a browser alert when a new task is assigned, or one day before a task&apos;s due date.
          </p>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-2)",
              marginBottom: 8,
            }}
          >
            Get notifications for
          </div>

          {members.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--fg-2)", marginBottom: 14 }}>
              No team members yet — add someone in Task Manager first.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, maxHeight: 160, overflowY: "auto" }}>
              {members.map((m) => (
                <label key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={selected.has(m)} onChange={() => toggleMember(m)} />
                  {m}
                </label>
              ))}
            </div>
          )}

          {permission === "unsupported" && (
            <p style={{ fontSize: 12, color: "var(--typical-orange)", margin: 0 }}>
              This browser doesn&apos;t support notifications.
            </p>
          )}
          {permission === "denied" && (
            <p style={{ fontSize: 12, color: "var(--typical-orange)", margin: 0 }}>
              Blocked — enable notifications for this site in your browser settings to receive alerts.
            </p>
          )}
          {permission === "granted" && (
            <p style={{ fontSize: 12, color: "var(--fg-2)", margin: 0 }}>Notifications enabled ✓</p>
          )}
          {permission === "default" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="tg-btn" onClick={() => setOpen(false)} style={{ flex: 1 }}>
                Not now
              </button>
              <button className="tg-btn tg-btn-done" onClick={enable} style={{ flex: 1 }}>
                Enable
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
