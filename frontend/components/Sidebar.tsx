"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Download, Sparkles, BarChart3, ShieldCheck, Car } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scrape", label: "Scrape", icon: Download },
  { href: "/cleaning", label: "Cleaning", icon: Sparkles },
  { href: "/eda", label: "EDA", icon: BarChart3 },
  { href: "/ethics", label: "Ethics", icon: ShieldCheck },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-ink-700 bg-ink-900/70 backdrop-blur px-4 py-6 flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <Car size={20} />
        </div>
        <div>
          <div className="font-semibold leading-tight">MotorLens UK</div>
          <div className="text-xs text-ink-400">DAT7403 · Portfolio 2</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                active
                  ? "bg-brand-500/15 text-brand-100 border border-brand-500/30"
                  : "text-ink-300 hover:bg-ink-800/70"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-xs text-ink-400 px-2">
        <div>Next.js · Tailwind</div>
        <div>FastAPI · pandas</div>
      </div>
    </aside>
  );
}
