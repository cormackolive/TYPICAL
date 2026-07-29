import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";

// Stand-ins for TYPICAL's licensed brand fonts (Arizona Flare / Founders Grotesk / Victor Serif).
// Swap these for the real self-hosted/Adobe Fonts files in SETUP.md once you have a license.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

const editorial = Fraunces({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-editorial",
  display: "swap",
});

const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TYPICAL — Influencer Gifting",
  description: "Internal influencer gifting tracker synced with Shopify",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${editorial.variable} ${sans.variable}`}>
      <head>
        {/* This is a standalone app, not embedded — if Shopify frames it in an admin
            iframe, login breaks because the session cookie can't reliably be set/read
            cross-site there. Shopify's iframe is sandboxed against plain JS top-navigation
            (window.top.location doesn't work), so breaking out requires App Bridge itself —
            it must be the very first script tag, with the API key meta tag before it. */}
        <meta name="shopify-api-key" content={process.env.SHOPIFY_CLIENT_ID ?? ""} />
        <Script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" strategy="beforeInteractive" />
        <Script id="break-out-of-iframe" strategy="beforeInteractive">
          {`if (window.top !== window.self) { window.open(window.self.location.href, "_top"); }`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
