import { createAdminClient } from "@/lib/supabase/admin";
import { fetchInfluencers, latestOrder } from "@/lib/data";
import { computeStatus, type Status } from "@/lib/status";
import NavBar from "@/components/NavBar";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export const dynamic = "force-dynamic";

const FULFILLMENT_KEYS = ["Delivered", "Partially complete / In transit", "Unfulfilled"] as const;

export default async function AnalyticsPage() {
  const supabase = createAdminClient();
  const influencers = await fetchInfluencers(supabase);

  const statusCounts: Record<Status, number> = { unfulfilled: 0, in_transit: 0, follow_up: 0, posted: 0 };
  influencers.forEach((inf) => {
    statusCounts[computeStatus(inf, latestOrder(inf))]++;
  });

  const allOrders = influencers.flatMap((inf) => inf.shopify_order);

  const fulfillmentCounts: Record<(typeof FULFILLMENT_KEYS)[number], number> = {
    Delivered: 0,
    "Partially complete / In transit": 0,
    Unfulfilled: 0,
  };
  let totalWsp = 0;
  allOrders.forEach((o) => {
    if (o.fulfillment_status) fulfillmentCounts[o.fulfillment_status]++;
    totalWsp += Number(o.line_items_total ?? 0);
  });

  const now = new Date();
  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString("en-US", { month: "long" }));
    const count = influencers.filter((inf) => {
      const created = new Date(inf.created_at);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    }).length;
    monthCounts.push(count);
  }

  const kpis = [
    { label: "Total PR Spend (RRP)", value: "$12,450" },
    { label: "Total WSP", value: `$${Math.round(totalWsp).toLocaleString()}` },
    { label: "Total Influencers", value: String(influencers.length) },
    { label: "Content Posted", value: String(statusCounts.posted) },
    { label: "Awaiting Follow-up", value: String(statusCounts.follow_up) },
  ];

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Analytics" />

      <div style={{ padding: "48px 40px 8px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 12 }}>
          Campaign Performance
        </div>
        <div style={{ fontSize: 16, color: "var(--fg-2)" }}>Track PR spend, content metrics, and influencer performance.</div>
      </div>

      <AnalyticsCharts
        kpis={kpis}
        contentStatus={{
          Posted: statusCounts.posted,
          "Delivered (awaiting)": statusCounts.follow_up,
          "In transit": statusCounts.in_transit,
          Unfulfilled: statusCounts.unfulfilled,
        }}
        fulfillment={fulfillmentCounts}
        monthLabels={monthLabels}
        monthCounts={monthCounts}
      />
    </div>
  );
}
