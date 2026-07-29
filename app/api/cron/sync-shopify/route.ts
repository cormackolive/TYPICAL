import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchRecentShopifyOrders,
  orderTagsMatch,
  deriveFulfillmentStatus,
  customerName,
  shippingAddressLabel,
  itemsSummary,
  trackingLabel,
} from "@/lib/shopify";

export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!shop || !accessToken) {
    return NextResponse.json(
      { error: "Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN in your environment variables first." },
      { status: 500 }
    );
  }

  const runStartedAt = new Date();
  // Always looks back 24h — upserts are idempotent, so re-scanning already-synced orders is harmless.
  const updatedAtMin = new Date(runStartedAt.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const supabase = createAdminClient();
  const orders = await fetchRecentShopifyOrders(shop, accessToken, updatedAtMin);
  const matching = orders.filter((o) => orderTagsMatch(o.tags));

  let created = 0;
  let updated = 0;

  for (const order of matching) {
    const name = customerName(order);
    if (!name) continue;

    let influencerId: string | null = null;
    const { data: existing } = await supabase.from("influencer").select("id").ilike("name", name).maybeSingle();

    if (existing) {
      influencerId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("influencer")
        .insert({ name })
        .select("id")
        .single();
      if (insertError) continue;
      influencerId = inserted.id;
      created++;
    }

    const { error: orderError } = await supabase.from("shopify_order").upsert(
      {
        shopify_order_id: String(order.id),
        influencer_id: influencerId,
        order_number: order.name,
        fulfillment_status: deriveFulfillmentStatus(order),
        shipping_address: shippingAddressLabel(order),
        items: itemsSummary(order),
        tracking: trackingLabel(order),
        order_date: order.created_at.slice(0, 10),
        tags: order.tags.split(",").map((t) => t.trim()).filter(Boolean),
        last_synced_at: runStartedAt.toISOString(),
      },
      { onConflict: "shopify_order_id" }
    );
    if (!orderError) updated++;
  }

  return NextResponse.json({ scanned: orders.length, matching: matching.length, influencersCreated: created, ordersUpserted: updated });
}
