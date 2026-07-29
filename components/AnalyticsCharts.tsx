"use client";

import { useEffect, useRef } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";

const PALETTE = {
  orange: "#F15A29",
  pink: "#FBE9F1",
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

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 20px 0" }}>{title}</div>
      <div style={{ border: "2px solid var(--typical-black)", padding: 20, height: 300 }}>{children}</div>
    </div>
  );
}

export default function AnalyticsCharts({
  kpis,
  contentStatus,
  fulfillment,
  monthLabels,
  monthCounts,
}: {
  kpis: { label: string; value: string }[];
  contentStatus: Record<string, number>;
  fulfillment: Record<string, number>;
  monthLabels: string[];
  monthCounts: number[];
}) {
  const contentStatusRef = useRef<HTMLCanvasElement>(null);
  const fulfillmentRef = useRef<HTMLCanvasElement>(null);
  const byMonthRef = useRef<HTMLCanvasElement>(null);

  useChart(contentStatusRef, {
    type: "doughnut",
    data: {
      labels: Object.keys(contentStatus),
      datasets: [
        {
          data: Object.values(contentStatus),
          backgroundColor: [PALETTE.orange, PALETTE.olive, PALETTE.gold, PALETTE.cream],
          borderColor: "#000",
          borderWidth: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { font: { size: 13 }, padding: 15 } } },
    },
  });

  useChart(fulfillmentRef, {
    type: "doughnut",
    data: {
      labels: Object.keys(fulfillment).map((k) => (k === "Partially complete / In transit" ? "In transit" : k)),
      datasets: [
        {
          data: Object.values(fulfillment),
          backgroundColor: [PALETTE.olive, PALETTE.gold, PALETTE.cream],
          borderColor: "#000",
          borderWidth: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { font: { size: 13 }, padding: 15 } } },
    },
  });

  useChart(byMonthRef, {
    type: "bar",
    data: {
      labels: monthLabels,
      datasets: [{ label: "Influencers", data: monthCounts, backgroundColor: PALETTE.orange, borderColor: "#000", borderWidth: 2 }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 13 } } },
        x: { ticks: { font: { size: 13 } } },
      },
    },
  });

  return (
    <>
      <div
        style={{
          padding: "24px 40px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {kpis.map((k) => (
          <div key={k.label} style={{ border: "2px solid var(--typical-black)", padding: 20, background: "var(--bg-1)" }}>
            <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 8 }}>
              {k.label}
            </div>
            <div style={{ fontFamily: "var(--font-editorial)", fontSize: 36 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 40px 80px" }}>
        <ChartSection title="Content Status">
          <canvas ref={contentStatusRef} />
        </ChartSection>
        <ChartSection title="Order Fulfillment Status">
          <canvas ref={fulfillmentRef} />
        </ChartSection>
        <ChartSection title="Influencers by Month">
          <canvas ref={byMonthRef} />
        </ChartSection>
      </div>
    </>
  );
}
