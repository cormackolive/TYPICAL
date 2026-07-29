"use client";

import { useEffect, useRef, useState } from "react";
import type { InfluencerDb, ShopifyOrderDb } from "@/lib/types";
import { computeStatus, STATUS_META, formatFollowers, igUrl, tiktokUrl } from "@/lib/status";

export default function InfluencerModal({
  influencer,
  order,
  onClose,
  onSave,
}: {
  influencer: InfluencerDb;
  order: ShopifyOrderDb | null;
  onClose: () => void;
  onSave: (patch: Partial<InfluencerDb>) => void;
}) {
  const status = computeStatus(influencer, order);
  const meta = STATUS_META[status];

  const [igDraft, setIgDraft] = useState("");
  const [tiktokDraft, setTiktokDraft] = useState("");
  const [notes, setNotes] = useState(influencer.notes ?? "");

  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(influencer.notes ?? "");
    setIgDraft("");
    setTiktokDraft("");
  }, [influencer.id]);

  function handleNotesChange(value: string) {
    setNotes(value);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => onSave({ notes: value }), 600);
  }

  function saveIgLink() {
    const draft = igDraft.trim();
    if (!draft) return;
    onSave({ ig_post_link: draft });
    setIgDraft("");
  }

  function saveTiktokLink() {
    const draft = tiktokDraft.trim();
    if (!draft) return;
    onSave({ tiktok_post_link: draft });
    setTiktokDraft("");
  }

  function toggleStory() {
    onSave({ story_posted: !influencer.story_posted });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,1,1,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-1)",
          width: "100%",
          maxWidth: 560,
          maxHeight: "88vh",
          overflowY: "auto",
          border: "var(--border-chunky)",
          padding: 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-editorial)", fontSize: 32, lineHeight: 1 }}>{influencer.name}</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6 }}>{influencer.location}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, background: meta.swatch, border: "1px solid rgba(0,0,0,0.2)" }} />
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-2)" }}>
              {meta.label}
            </span>
            <span onClick={onClose} style={{ cursor: "pointer", fontSize: 22, lineHeight: 1, marginLeft: 12 }}>
              ×
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 24, fontSize: 14 }}>
          <Field label="Followers">{formatFollowers(influencer.followers)}</Field>
          <Field label="Persona">{influencer.persona || "—"}</Field>
          <Field label="Instagram">
            {influencer.ig_handle ? (
              <a className="tg-link" href={igUrl(influencer.ig_handle)} target="_blank" rel="noreferrer">
                {influencer.ig_handle}
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="TikTok">
            {influencer.tiktok_handle ? (
              <a className="tg-link" href={tiktokUrl(influencer.tiktok_handle)} target="_blank" rel="noreferrer">
                {influencer.tiktok_handle}
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Order #">{order?.order_number || "—"}</Field>
          <Field label="Fulfillment">{order?.fulfillment_status || "—"}</Field>
          <Field label="Shipping address" full>
            {order?.shipping_address || "—"}
          </Field>
          <Field label="Items received" full>
            {order?.items || "—"}
          </Field>
          {order?.tracking && <Field label="Tracking" full>{order.tracking}</Field>}
        </div>

        <div style={{ border: "var(--border-hair)", padding: 16, marginBottom: 20 }}>
          <div style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em", color: "var(--fg-2)", marginBottom: 10 }}>
            Mark content posted
          </div>

          {influencer.ig_post_link && (
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              Instagram post:{" "}
              <a className="tg-link" href={influencer.ig_post_link} target="_blank" rel="noreferrer">
                {influencer.ig_post_link}
              </a>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              className="tg-input"
              type="text"
              placeholder="Paste Instagram post link…"
              value={igDraft}
              onChange={(e) => setIgDraft(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="tg-btn tg-btn-done" onClick={saveIgLink}>
              Posted ✓
            </button>
          </div>

          {influencer.tiktok_post_link && (
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              TikTok post:{" "}
              <a className="tg-link" href={influencer.tiktok_post_link} target="_blank" rel="noreferrer">
                {influencer.tiktok_post_link}
              </a>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              className="tg-input"
              type="text"
              placeholder="Paste TikTok post link…"
              value={tiktokDraft}
              onChange={(e) => setTiktokDraft(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="tg-btn tg-btn-done" onClick={saveTiktokLink}>
              Posted ✓
            </button>
          </div>

          <button
            className="tg-btn"
            onClick={toggleStory}
            style={influencer.story_posted ? { background: "var(--typical-black)", color: "#fff" } : undefined}
          >
            {influencer.story_posted ? "✓ Story posted" : "Mark story posted"}
          </button>
        </div>

        <div>
          <div style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em", color: "var(--fg-2)", marginBottom: 6 }}>
            Notes
          </div>
          <textarea
            className="tg-notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="e.g. DM'd again 7/28, no reply"
            style={{
              width: "100%",
              minHeight: 90,
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              border: "var(--border-hair)",
              padding: 10,
              resize: "vertical",
              boxSizing: "border-box",
              background: "var(--bg-1)",
              color: "var(--fg-1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <div style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em", color: "var(--fg-2)", marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
