import { NextResponse } from "next/server";
import crypto from "crypto";
import { shopifyAuthorizeUrl } from "@/lib/shopify";

// Visit this once, after deploying, to connect your Shopify store: {your-app-url}/api/shopify/install
export async function GET() {
  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  const appUrl = process.env.SHOPIFY_APP_URL;
  if (!shop || !appUrl) {
    return NextResponse.json(
      { error: "Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_APP_URL in your environment variables first." },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${appUrl}/api/shopify/callback`;
  const authorizeUrl = shopifyAuthorizeUrl({ shop, state, redirectUri });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
