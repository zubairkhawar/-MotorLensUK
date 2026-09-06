import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "MotorLens UK — Automotive Market Intelligence",
  description: "DAT7403 Portfolio 2 — scraping, cleaning, EDA for the UK automotive market",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased overflow-x-hidden">
        <div className="glow-orb bg-brand-500 w-[500px] h-[500px] top-0 left-1/3" />
        <div className="glow-orb bg-accent-500 w-[400px] h-[400px] top-1/2 right-0" />
        <Sidebar />
        <main className="ml-64 p-8 max-w-[1600px] relative z-10">{children}</main>
      </body>
    </html>
  );
}
