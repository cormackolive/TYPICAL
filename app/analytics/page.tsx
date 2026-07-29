"use client";

import { useEffect, useRef } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import NavBar from "@/components/NavBar";

// Mock data — not yet wired to real Shopify/influencer data.
const KPIS = [
  { label: "Total PR Spend (RRP)", value: "$12,450" },
  { label: "Total WSP", value: "$8,320" },
  { label: "Total Influencers", value: "35" },
  { label: "Content Posted", value: "12" },
  { label: "Awaiting Follow-up", value: "8" },
];

const PALETTE = {
  orange: "#F15A29",
  pink: "#EFA8C4",
  gold: "#EFC988",
  olive: "#DDE2C0",
  cream: "#F3EFE9",
};

function useChart(canvasRef: React.RefObject<HTMLCanvasElement | null>, config: ChartConfiguration) {
  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new Chart(canvasRef.current, config);
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function AnalyticsPage() {
  const contentStatusRef = useRef<HTMLCanvasElement>(null);
  const fulfillmentRef = useRef<HTMLCanvasElement>(null);
  const byMonthRef = useRef<HTMLCanvasElement>(null);

  useChart(contentStatusRef, {
    type: "doughnut",
    data: {
      labels: ["Posted", "Delivered (awaiting)", "In transit", "Unfulfilled"],
      datasets: [{ data: [12, 8, 10, 5], backgroundColor: [PALETTE.pink, PALETTE.olive, PALETTE.gold, PALETTE.cream] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  useChart(fulfillmentRef, {
    type: "doughnut",
    data: {
      labels: ["Delivered", "In transit", "Unfulfilled"],
      datasets: [{ data: [18, 10, 7], backgroundColor: [PALETTE.olive, PALETTE.gold, PALETTE.cream] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });

  useChart(byMonthRef, {
    type: "bar",
    data: {
      labels: ["June", "July", "August"],
      datasets: [{ label: "Influencers", data: [9, 14, 12], backgroundColor: PALETTE.orange }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)" }}>
      <NavBar section="Analytics" />

      <div style={{ padding: "48px 40px 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.01em", marginBottom: 8 }}>
          Campaign Performance
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)" }}>
          A snapshot of gifting spend and content performance. Sample data — not yet wired to live totals.
        </div>
      </div>

      <div style={{ padding: "0 40px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {KPIS.map((k) => (
          <div key={k.label} style={{ border: "2px solid var(--typical-black)", padding: 18, background: "var(--bg-1)" }}>
            <div style={{ fontFamily: "var(--font-editorial)", fontSize: 26, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, letterSpacing: "0.04em", color: "var(--fg-2)", textTransform: "uppercase" }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 40px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        <div style={{ border: "var(--border-line)", padding: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 12 }}>
            Content Status
          </div>
          <canvas ref={contentStatusRef} height={220} />
        </div>
        <div style={{ border: "var(--border-line)", padding: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 12 }}>
            Order Fulfillment Status
          </div>
          <canvas ref={fulfillmentRef} height={220} />
        </div>
        <div style={{ border: "var(--border-line)", padding: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 12 }}>
            Influencers by Month
          </div>
          <canvas ref={byMonthRef} height={220} />
        </div>
      </div>
    </div>
  );
}
