"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Download, Sparkles, BarChart3, ShieldCheck, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scrape", label: "Scrape", icon: Download },
  { href: "/listings", label: "Listings", icon: Table },
  { href: "/cleaning", label: "Cleaning", icon: Sparkles },
  { href: "/eda", label: "EDA", icon: BarChart3 },
  { href: "/ethics", label: "Ethics", icon: ShieldCheck },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/5 bg-ink-950/50 backdrop-blur-xl px-4 py-6 flex flex-col z-20">
      <div className="flex items-center gap-3 px-2 mb-10">
        <Logo size={40} />
        <div>
          <div className="font-bold text-white leading-tight tracking-tight">MotorLens UK</div>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ring-focus",
                active
                  ? "bg-gradient-to-r from-brand-500/20 to-accent-500/10 text-white border border-brand-500/30 shadow-glow"
                  : "text-ink-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} className={cn("transition-transform", active ? "text-brand-300" : "group-hover:scale-110")} />
              <span className="font-medium">{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="divider mb-4" />
        <div className="px-2 space-y-1 text-[11px] text-ink-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live backend</span>
          </div>
          <div>Next.js · Tailwind · Recharts</div>
          <div>FastAPI · pandas · Playwright</div>
        </div>
      </div>
    </aside>
  );
}
