import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
