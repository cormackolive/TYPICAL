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

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  // Vercel's scheduled cron sends the secret as a header; a manually-visited
  // browser link can't set headers, so a `?secret=` query param is also accepted.
  const querySecret = new URL(request.url).searchParams.get("secret");

  const authorized =
    !!secret &&
    ((auth !== null && timingSafeEqualStr(auth, `Bearer ${secret}`)) ||
      (querySecret !== null && timingSafeEqualStr(querySecret, secret)));

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: shop, error: shopError } = await supabase.from("shopify_shop").select("*").eq("id", 1).maybeSingle();
  if (shopError) return NextResponse.json({ error: shopError.message }, { status: 500 });
  if (!shop) return NextResponse.json({ message: "Shopify not connected yet — visit /api/shopify/install." });

  const runStartedAt = new Date();
  const updatedAtMin = shop.last_synced_at
    ? new Date(new Date(shop.last_synced_at).getTime() - 5 * 60 * 1000).toISOString()
    : new Date(runStartedAt.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const orders = await fetchRecentShopifyOrders(shop.shop_domain, shop.access_token, updatedAtMin);
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

  await supabase.from("shopify_shop").update({ last_synced_at: runStartedAt.toISOString() }).eq("id", 1);

  return NextResponse.json({ scanned: orders.length, matching: matching.length, influencersCreated: created, ordersUpserted: updated });
}
