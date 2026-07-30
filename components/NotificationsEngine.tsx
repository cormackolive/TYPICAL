"use client";

import { useEffect } from "react";
import { getNotificationPrefs } from "@/lib/notifications";
import type { AssignmentDb } from "@/lib/types";

const POLL_MS = 45_000;
const SEEN_IDS_KEY = "typical-notifications-seen-ids";
const DUE_NOTIFIED_KEY = "typical-notifications-due-notified";

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

function isTomorrow(dateStr: string): boolean {
  const due = new Date(`${dateStr}T00:00:00`);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return due.getTime() === tomorrow.getTime();
}

// Fires real browser Notifications while this tab is open — there's no service
// worker, so nothing arrives once the site itself is closed.
export default function NotificationsEngine() {
  useEffect(() => {
    let cancelled = false;

    async function check() {
      const prefs = getNotificationPrefs();
      if (!prefs.enabled || prefs.members.length === 0) return;
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

      let assignments: AssignmentDb[];
      try {
        const res = await fetch("/api/assignments");
        if (!res.ok) return;
        assignments = await res.json();
      } catch {
        return;
      }
      if (cancelled) return;

      const relevant = assignments.filter((a) => a.team_member && prefs.members.includes(a.team_member));

      // First time this ever runs on a device, mark everything already there as
      // "seen" instead of notifying — otherwise enabling notifications for someone
      // with existing tasks would fire one alert per pre-existing task.
      const rawSeen = localStorage.getItem(SEEN_IDS_KEY);
      const isFirstRun = rawSeen === null;
      const seenIds: Set<string> = rawSeen ? new Set(JSON.parse(rawSeen)) : new Set();

      relevant.forEach((a) => {
        if (!seenIds.has(a.id)) {
          seenIds.add(a.id);
          if (!isFirstRun) {
            new Notification(`New task for ${a.team_member}`, {
              body: a.message || a.influencer_name || "New task assigned.",
              tag: `assignment-${a.id}`,
            });
          }
        }
      });
      writeIdSet(SEEN_IDS_KEY, seenIds);

      const dueNotified = readIdSet(DUE_NOTIFIED_KEY);
      relevant.forEach((a) => {
        if (a.due_date && a.status !== "Complete" && isTomorrow(a.due_date) && !dueNotified.has(a.id)) {
          dueNotified.add(a.id);
          new Notification(`Due tomorrow: ${a.team_member}`, {
            body: a.message || a.influencer_name || "Task due tomorrow.",
            tag: `due-${a.id}`,
          });
        }
      });
      writeIdSet(DUE_NOTIFIED_KEY, dueNotified);
    }

    check();
    const interval = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}
