import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  accent = "brand",
  loading,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  accent?: "brand" | "emerald" | "amber" | "rose" | "purple";
  loading?: boolean;
}) {
  const orbAccents = {
    brand: "from-brand-500/30 to-brand-500/0",
    emerald: "from-emerald-500/30 to-emerald-500/0",
    amber: "from-amber-500/30 to-amber-500/0",
    rose: "from-rose-500/30 to-rose-500/0",
    purple: "from-accent-500/30 to-accent-500/0",
  };
  const iconAccents = {
    brand: "text-brand-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    purple: "text-accent-400",
  };
  return (
    <div className="card card-hover relative overflow-hidden group animate-slide-up">
      <div className={cn(
        "absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-2xl",
        orbAccents[accent]
      )} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="stat-label">{label}</div>
          {Icon && <Icon size={16} className={iconAccents[accent]} />}
        </div>
        <div className={cn("stat-value", loading && "animate-shimmer h-9 rounded-lg bg-white/5")}>
          {loading ? "\u00A0" : value}
        </div>
        {hint && <div className="text-[11px] text-ink-400 mt-1">{hint}</div>}
      </div>
    </div>
  );
}
