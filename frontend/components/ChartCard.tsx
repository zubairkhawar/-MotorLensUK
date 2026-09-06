export function ChartCard({
  title,
  subtitle,
  children,
  action,
  height = "h-72",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  height?: string;
}) {
  return (
    <div className="card card-hover animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={height}>{children}</div>
    </div>
  );
}
