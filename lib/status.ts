export type Status = "unfulfilled" | "in_transit" | "follow_up" | "posted";

export const STATUS_META: Record<Status, { label: string; desc: string; swatch: string }> = {
  unfulfilled: { label: "Unfulfilled", desc: "Order unfulfilled", swatch: "#FEFDFA" },
  in_transit: { label: "In transit", desc: "Shipped, in transit / not yet delivered", swatch: "#F5B8A3" },
  follow_up: { label: "Follow up", desc: "Delivered — follow up for content", swatch: "#E1F5EF" },
  posted: { label: "Posted", desc: "Content posted (link or story confirmed)", swatch: "#EFA8C4" },
};

export interface InfluencerRow {
  id: string;
  name: string;
  location: string | null;
  ig_handle: string | null;
  tiktok_handle: string | null;
  followers: number | null;
  persona: string | null;
  notes: string | null;
  ig_post_link: string | null;
  tiktok_post_link: string | null;
  story_posted: boolean;
}

export interface ShopifyOrderRow {
  id: string;
  influencer_id: string | null;
  order_number: string | null;
  fulfillment_status: "Unfulfilled" | "Partially complete / In transit" | "Delivered" | null;
  shipping_address: string | null;
  items: string | null;
  tracking: string | null;
  order_date: string | null;
}

export function computeStatus(influencer: InfluencerRow, order: ShopifyOrderRow | null): Status {
  if (influencer.story_posted || influencer.ig_post_link || influencer.tiktok_post_link) return "posted";
  const fulfillment = order?.fulfillment_status;
  if (fulfillment === "Delivered") return "follow_up";
  if (fulfillment === "Partially complete / In transit") return "in_transit";
  return "unfulfilled";
}

/** Card background differs from the legend/summary swatch only for the "posted" status. */
export function cardSwatch(status: Status, influencer: InfluencerRow): { bg: string; textColor: string } {
  if (status === "posted") {
    if (influencer.story_posted && !influencer.ig_post_link && !influencer.tiktok_post_link) {
      return { bg: "#EBB3D0", textColor: "#FFFFFF" };
    }
    return { bg: "#FBE9F1", textColor: "var(--typical-ink)" };
  }
  return { bg: STATUS_META[status].swatch, textColor: "var(--typical-ink)" };
}

export function footerLabel(status: Status, influencer: InfluencerRow): string {
  if (status === "posted") {
    const parts = [
      influencer.ig_post_link && "IG",
      influencer.tiktok_post_link && "TikTok",
      influencer.story_posted && "Story",
    ].filter(Boolean);
    return "Posted · " + parts.join(" + ");
  }
  return STATUS_META[status].label;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatFollowers(n: number | null): string {
  if (!n) return "—";
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return String(n);
}

export function igUrl(handle: string | null): string {
  if (!handle) return "#";
  return "https://instagram.com/" + handle.replace("@", "");
}

export function tiktokUrl(handle: string | null): string {
  if (!handle) return "#";
  return "https://tiktok.com/" + handle.replace("@", "");
}

export type SortBy = "name" | "followers_desc" | "followers_asc" | "status" | "date_desc" | "date_asc";

export const STATUS_ORDER: Status[] = ["follow_up", "in_transit", "unfulfilled", "posted"];
