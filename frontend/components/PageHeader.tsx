import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  gradient,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  gradient?: boolean;
}) {
  return (
    <header className="mb-10 relative animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          {eyebrow && (
            <div className="stat-label text-brand-300 mb-2">{eyebrow}</div>
          )}
          <h1 className={cn(
            "text-4xl font-bold tracking-tight",
            gradient ? "hero-gradient-text" : "text-white"
          )}>
            {title}
          </h1>
          {description && (
            <p className="text-ink-300 mt-2 max-w-2xl">{description}</p>
          )}
        </div>
        {action && <div className="flex gap-2 shrink-0">{action}</div>}
      </div>
    </header>
  );
}
