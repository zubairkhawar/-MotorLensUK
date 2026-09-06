"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Download, RefreshCw, Play, Globe, Zap, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

const TOOL_ICONS: Record<string, any> = {
  BeautifulSoup: Globe,
  Playwright: Zap,
  "requests+regex": Code2,
};

const TOOL_COLORS: Record<string, string> = {
  BeautifulSoup: "from-brand-500 to-brand-600",
  Playwright: "from-accent-500 to-fuchsia-600",
  "requests+regex": "from-emerald-500 to-teal-600",
};

export default function ScrapePage() {
  const [sources, setSources] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [pages, setPages] = useState(3);

  const refresh = () => {
    api.listSources().then(setSources).catch(() => {});
    api.listJobs().then(setJobs).catch(() => {});
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, []);

  const run = async (source: string) => {
    setBusy(source);
    try {
      await api.startScrape(source, pages);
      refresh();
    } finally {
      setTimeout(() => setBusy(null), 1200);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scrape Console"
        description="Three UK automotive sources, three scraping tools. Trigger jobs individually and watch progress in real time."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((s) => {
          const Icon = TOOL_ICONS[s.tool] || Globe;
          const gradient = TOOL_COLORS[s.tool] || "from-brand-500 to-brand-600";
          return (
            <div key={s.key} className="card card-hover group relative overflow-hidden animate-slide-up">
              <div className={cn(
                "absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br opacity-30 blur-3xl group-hover:opacity-60 transition",
                gradient
              )} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-glow",
                    gradient
                  )}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="badge bg-white/5 text-ink-300 border border-white/10">{s.tool}</span>
                </div>
                <div className="text-lg font-semibold tracking-tight">{s.name}</div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-300 hover:text-brand-200 mt-1 inline-block truncate"
                >
                  {s.url}
                </a>
                <button
                  onClick={() => run(s.key)}
                  disabled={busy === s.key}
                  className={cn("btn-primary w-full justify-center mt-5", busy === s.key && "opacity-60 cursor-wait")}
                >
                  {busy === s.key ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  {busy === s.key ? "Scraping…" : "Run scraper"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold flex items-center gap-2">
            <Download size={16} className="text-brand-300" /> Recent scrape jobs
          </h2>
          <span className="text-xs text-ink-400">{jobs.length} total · auto-refresh 2.5s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-ink-400 text-[11px] uppercase tracking-wider bg-white/[0.02]">
              <tr>
                <th className="text-left py-3 px-5">ID</th>
                <th className="text-left py-3 px-3">Source</th>
                <th className="text-left py-3 px-3">Tool</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-right py-3 px-3">Rows</th>
                <th className="text-left py-3 px-3">Started</th>
                <th className="text-left py-3 px-5">Duration</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const dur = j.finished_at
                  ? Math.round((new Date(j.finished_at).getTime() - new Date(j.started_at).getTime()) / 100) / 10
                  : null;
                return (
                  <tr key={j.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors animate-fade-in">
                    <td className="py-2.5 px-5 text-ink-400 font-mono text-xs">#{j.id}</td>
                    <td className="py-2.5 px-3 font-medium">{j.source}</td>
                    <td className="py-2.5 px-3 text-ink-300 text-xs">{j.tool}</td>
                    <td className="py-2.5 px-3">
                      <span className={cn(
                        "badge",
                        j.status === "completed" && "bg-emerald-500/15 text-emerald-300",
                        j.status === "running" && "bg-amber-500/15 text-amber-300 animate-pulse",
                        j.status === "failed" && "bg-rose-500/15 text-rose-300",
                        j.status === "pending" && "bg-white/5 text-ink-300"
                      )}>{j.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{j.rows_scraped || 0}</td>
                    <td className="py-2.5 px-3 text-ink-400 text-xs">
                      {new Date(j.started_at).toLocaleTimeString("en-GB")}
                    </td>
                    <td className="py-2.5 px-5 text-ink-400 text-xs tabular-nums">
                      {dur !== null ? `${dur}s` : "—"}
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-400">
                    No jobs yet — click <span className="text-white font-semibold">Run scraper</span> on a card above to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
