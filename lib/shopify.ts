export const SHOPIFY_API_VERSION = "2024-10";
export const SHOPIFY_SCOPES = "read_orders,read_customers";

/** Env vars are trimmed defensively — a stray trailing space/newline from copy-pasting into Vercel is a common, invisible cause of auth failures. */
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

export function shopifyAuthorizeUrl(params: { shop: string; state: string; redirectUri: string }) {
  const url = new URL(`https://${params.shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", requiredEnv("SHOPIFY_CLIENT_ID"));
  url.searchParams.set("scope", SHOPIFY_SCOPES);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  return url.toString();
}

export async function exchangeShopifyCode(shop: string, code: string): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requiredEnv("SHOPIFY_CLIENT_ID"),
      client_secret: requiredEnv("SHOPIFY_CLIENT_SECRET"),
      code,
    }),
  });
  if (!res.ok) throw new Error(`Shopify token exchange failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.access_token as string;
}

interface ShopifyLineItem {
  title: string;
  variant_title: string | null;
  quantity: number;
}

interface ShopifyFulfillment {
  tracking_company: string | null;
  tracking_number: string | null;
  shipment_status: string | null;
}

interface ShopifyDiscountCode {
  code: string;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  tags: string;
  discount_codes: ShopifyDiscountCode[];
  fulfillment_status: "fulfilled" | "partial" | null;
  fulfillments: ShopifyFulfillment[];
  line_items: ShopifyLineItem[];
  customer: { first_name: string | null; last_name: string | null } | null;
  shipping_address: {
    first_name: string | null;
    last_name: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    zip: string | null;
    country: string | null;
  } | null;
}

/**
 * Fetches orders, following pagination up to a sane cap. Pass `updatedAtMin` to
 * only fetch orders touched since then (incremental sync); omit it entirely to
 * fetch full order history (first-time backfill).
 */
export async function fetchRecentShopifyOrders(
  shop: string,
  accessToken: string,
  updatedAtMin?: string
): Promise<ShopifyOrder[]> {
  const orders: ShopifyOrder[] = [];
  const updatedAtParam = updatedAtMin ? `&updated_at_min=${encodeURIComponent(updatedAtMin)}` : "";
  let url: string | null =
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250${updatedAtParam}&fields=${encodeURIComponent(
      "id,name,created_at,tags,discount_codes,fulfillment_status,fulfillments,line_items,customer,shipping_address"
    )}`;

  let pages = 0;
  while (url && pages < 40) {
    const res: Response = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (!res.ok) throw new Error(`Shopify orders fetch failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    orders.push(...(json.orders as ShopifyOrder[]));

    const link = res.headers.get("link");
    const next = link?.split(",").find((part) => part.includes('rel="next"'));
    const match = next?.match(/<([^>]+)>/);
    url = match ? match[1] : null;
    pages++;
  }

  return orders;
}

/** Matches orders tagged "influencer"/"marketing", or paid for with an influencer discount code. */
export function orderMatchesInfluencerCriteria(order: ShopifyOrder): boolean {
  const lowerTags = order.tags.toLowerCase();
  if (lowerTags.includes("influencer") || lowerTags.includes("marketing")) return true;
  return order.discount_codes?.some((d) => d.code.toLowerCase().includes("influencer")) ?? false;
}

export function deriveFulfillmentStatus(order: ShopifyOrder): "Unfulfilled" | "Partially complete / In transit" | "Delivered" {
  const delivered = order.fulfillments?.some((f) => f.shipment_status === "delivered");
  if (delivered) return "Delivered";
  if (order.fulfillment_status === "fulfilled" || order.fulfillment_status === "partial") {
    return "Partially complete / In transit";
  }
  return "Unfulfilled";
}

export function customerName(order: ShopifyOrder): string | null {
  const sa = order.shipping_address;
  if (sa?.first_name || sa?.last_name) return [sa.first_name, sa.last_name].filter(Boolean).join(" ");
  const c = order.customer;
  if (c?.first_name || c?.last_name) return [c.first_name, c.last_name].filter(Boolean).join(" ");
  return null;
}

export function shippingAddressLabel(order: ShopifyOrder): string | null {
  const a = order.shipping_address;
  if (!a) return null;
  return [a.address1, a.address2, a.city, a.province, a.zip, a.country].filter(Boolean).join(", ");
}

export function itemsSummary(order: ShopifyOrder): string {
  return order.line_items
    .map((li) => {
      const variant = li.variant_title ? ` (${li.variant_title})` : "";
      const qty = li.quantity > 1 ? ` x${li.quantity}` : "";
      return `${li.title}${variant}${qty}`;
    })
    .join(", ");
}

export function trackingLabel(order: ShopifyOrder): string | null {
  const f = order.fulfillments?.find((f) => f.tracking_number);
  if (!f) return null;
  return [f.tracking_company, f.tracking_number].filter(Boolean).join(" ");
}
