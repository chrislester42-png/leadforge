import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const jakarta = Outfit({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "LeadForge — AI-Powered Lead Generation",
  description: "Scrape, enrich, and personalize B2B leads at scale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-jakarta`}>{children}</body>
    </html>
  );
}
