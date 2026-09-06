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
      <body className="font-sans antialiased">
        <Sidebar />
        <main className="ml-60 p-8 max-w-[1600px]">{children}</main>
      </body>
    </html>
  );
}
