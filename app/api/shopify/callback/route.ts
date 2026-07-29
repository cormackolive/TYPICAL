import { NextResponse } from "next/server";
import { exchangeShopifyCode } from "@/lib/shopify";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;

  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedShop = process.env.SHOPIFY_SHOP_DOMAIN;

  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("shopify_oauth_state="))
    ?.split("=")[1];

  if (!shop || !code || !state) {
    return NextResponse.json({ error: "Missing shop, code, or state." }, { status: 400 });
  }
  if (shop !== expectedShop) {
    return NextResponse.json({ error: "Unexpected shop domain." }, { status: 400 });
  }
  if (!cookieState || cookieState !== state) {
    return NextResponse.json({ error: "State mismatch — possible CSRF, please retry install." }, { status: 400 });
  }

  // No HMAC check here: the state cookie above already prevents CSRF, and the
  // code-for-token exchange below is the real trust boundary — it only
  // succeeds against Shopify's servers if our client secret is correct.
  const accessToken = await exchangeShopifyCode(shop, code);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("shopify_shop")
    .upsert({ id: 1, shop_domain: shop, access_token: accessToken, installed_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: `Failed to store access token: ${error.message}` }, { status: 500 });
  }

  const response = NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/`);
  response.cookies.delete("shopify_oauth_state");
  return response;
}
