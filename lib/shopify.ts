export const SHOPIFY_API_VERSION = "2024-10";

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

export interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  tags: string;
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

/** Fetches orders updated since `updatedAtMin`, following pagination up to a sane cap. */
export async function fetchRecentShopifyOrders(
  shop: string,
  accessToken: string,
  updatedAtMin: string
): Promise<ShopifyOrder[]> {
  const orders: ShopifyOrder[] = [];
  let url: string | null =
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250&updated_at_min=${encodeURIComponent(
      updatedAtMin
    )}&fields=${encodeURIComponent(
      "id,name,created_at,tags,fulfillment_status,fulfillments,line_items,customer,shipping_address"
    )}`;

  let pages = 0;
  while (url && pages < 10) {
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

export function orderTagsMatch(tags: string): boolean {
  const lower = tags.toLowerCase();
  return lower.includes("influencer") || lower.includes("marketing");
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
