import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card text-center py-16 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Icon size={22} className="text-brand-300" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-ink-400 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
