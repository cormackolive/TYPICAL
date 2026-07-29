"use client";

import type { InfluencerDb, ShopifyOrderDb } from "@/lib/types";
import { computeStatus, cardSwatch, footerLabel, initials, igUrl } from "@/lib/status";

export default function InfluencerCard({
  influencer,
  order,
  onOpen,
}: {
  influencer: InfluencerDb;
  order: ShopifyOrderDb | null;
  onOpen: () => void;
}) {
  const status = computeStatus(influencer, order);
  const { bg, textColor } = cardSwatch(status, influencer);
  const label = footerLabel(status, influencer);

  const postLink = influencer.ig_post_link || influencer.tiktok_post_link || "";
  const showSeePost = status === "posted" && !!postLink;
  const showStoryPosted = status === "posted" && !postLink;

  return (
    <div
      className="tg-card"
      onClick={onOpen}
      style={{
        cursor: "pointer",
        aspectRatio: "1",
        border: "2px solid var(--typical-black)",
        backgroundColor: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 14,
        textAlign: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 9999,
          background: "rgba(0,0,0,0.14)",
          border: "1.5px solid rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-editorial)",
          fontSize: 18,
          color: textColor,
        }}
      >
        {initials(influencer.name)}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: textColor, lineHeight: 1.2 }}>
        {influencer.name}
      </div>
      {status === "follow_up" && (
        <a
          href={igUrl(influencer.ig_handle)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="tg-pill"
          style={{ color: "var(--typical-orange)" }}
        >
          Follow up
        </a>
      )}
      {showSeePost && (
        <a
          href={postLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="tg-pill"
          style={{ color: "var(--typical-ink)" }}
        >
          See post
        </a>
      )}
      {showStoryPosted && (
        <div className="tg-pill" style={{ color: "var(--typical-ink)" }}>
          Story posted
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 10,
          fontStyle: "italic",
          color: "var(--fg-2)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
