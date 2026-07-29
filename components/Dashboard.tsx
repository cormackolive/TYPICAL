"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { latestOrder } from "@/lib/data";
import type { InfluencerDb } from "@/lib/types";
import {
  computeStatus,
  STATUS_META,
  STATUS_ORDER,
  type Status,
  type SortBy,
} from "@/lib/status";
import InfluencerCard from "./InfluencerCard";
import InfluencerModal from "./InfluencerModal";

export default function Dashboard({ initialInfluencers }: { initialInfluencers: InfluencerDb[] }) {
  const [influencers, setInfluencers] = useState<InfluencerDb[]>(initialInfluencers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/influencers");
    if (res.ok) setInfluencers(await res.json());
  }, []);

  // No realtime subscription (that requires Supabase-authenticated access, which
  // this app no longer has — see middleware.ts). Poll instead.
  useEffect(() => {
    const interval = setInterval(refetch, 20_000);
    return () => clearInterval(interval);
  }, [refetch]);

  const rows = useMemo(
    () =>
      influencers.map((inf) => {
        const order = latestOrder(inf);
        return { influencer: inf, order, status: computeStatus(inf, order) };
      }),
    [influencers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = rows.filter((r) => {
      if (q && !r.influencer.name.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });

    result = result.slice().sort((a, b) => {
      if (sortBy === "followers_desc") return (b.influencer.followers ?? 0) - (a.influencer.followers ?? 0);
      if (sortBy === "followers_asc") return (a.influencer.followers ?? 0) - (b.influencer.followers ?? 0);
      if (sortBy === "status") return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (sortBy === "date_desc") return (b.order?.order_date ?? "").localeCompare(a.order?.order_date ?? "");
      if (sortBy === "date_asc") return (a.order?.order_date ?? "").localeCompare(b.order?.order_date ?? "");
      return a.influencer.name.localeCompare(b.influencer.name);
    });

    return result;
  }, [rows, query, statusFilter, sortBy]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { unfulfilled: 0, in_transit: 0, follow_up: 0, posted: 0 };
    rows.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const lastSyncedAt = useMemo(() => {
    let latest: string | null = null;
    influencers.forEach((inf) => {
      inf.shopify_order.forEach((o) => {
        if (!latest || o.last_synced_at > latest) latest = o.last_synced_at;
      });
    });
    return latest;
  }, [influencers]);

  const lastSyncedLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Los_Angeles",
      }) + " PT"
    : "never yet";

  const selected = selectedId ? rows.find((r) => r.influencer.id === selectedId) : undefined;

  async function handleSave(patch: Partial<InfluencerDb>) {
    if (!selectedId) return;
    setInfluencers((prev) => prev.map((inf) => (inf.id === selectedId ? { ...inf, ...patch } : inf)));
    const res = await fetch(`/api/influencers/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error("Failed to save:", await res.text());
      refetch();
    }
  }

  return (
    <div className="typical" style={{ minHeight: "100vh", background: "var(--bg-1)", fontFamily: "var(--font-sans)", padding: "32px 40px 80px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          borderBottom: "var(--border-line)",
          paddingBottom: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 32, letterSpacing: "-0.01em" }}>TYPICAL</span>
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--fg-2)",
              borderLeft: "var(--border-hair)",
              paddingLeft: 18,
            }}
          >
            Influencer Gifting
          </span>
          <span style={{ fontSize: 11, letterSpacing: "0.04em", color: "var(--fg-2)", borderLeft: "var(--border-hair)", paddingLeft: 18 }}>
            Synced with Shopify · Last synced {lastSyncedLabel}
          </span>
        </div>
        <input
          className="tg-input"
          type="text"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 260 }}
        />
      </div>

      {/* Summary bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {(["unfulfilled", "in_transit", "follow_up", "posted"] as Status[]).map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, border: "var(--border-hair)", padding: "10px 14px", background: "var(--bg-1)" }}>
            <span style={{ width: 10, height: 10, borderRadius: 9999, background: STATUS_META[s].swatch, border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
            <span style={{ fontSize: 20, fontFamily: "var(--font-editorial)" }}>{counts[s]}</span>
            <span style={{ fontSize: 12, letterSpacing: "0.03em", color: "var(--fg-2)", textTransform: "uppercase" }}>{STATUS_META[s].label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select className="tg-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")}>
            <option value="all">All statuses</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="in_transit">In transit</option>
            <option value="follow_up">Follow up</option>
            <option value="posted">Posted</option>
          </select>
          <select className="tg-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
            <option value="name">Sort: Name A–Z</option>
            <option value="followers_desc">Sort: Followers (high–low)</option>
            <option value="followers_asc">Sort: Followers (low–high)</option>
            <option value="status">Sort: Type</option>
            <option value="date_desc">Sort: Order date (newest)</option>
            <option value="date_asc">Sort: Order date (oldest)</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", border: "var(--border-hair)", padding: "10px 16px" }}>
          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-2)" }}>Legend</span>
          {(["unfulfilled", "in_transit", "follow_up", "posted"] as Status[]).map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }} title={STATUS_META[s].desc}>
              <span style={{ width: 12, height: 12, background: STATUS_META[s].swatch, border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--fg-1)" }}>{STATUS_META[s].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-2)", marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? "influencer" : "influencers"}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
        {filtered.map((r) => (
          <InfluencerCard
            key={r.influencer.id}
            influencer={r.influencer}
            order={r.order}
            onOpen={() => setSelectedId(r.influencer.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--fg-2)", fontFamily: "var(--font-editorial)", fontSize: 22 }}>
          No influencers match those filters.
        </div>
      )}

      {selected && (
        <InfluencerModal
          influencer={selected.influencer}
          order={selected.order}
          onClose={() => setSelectedId(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
