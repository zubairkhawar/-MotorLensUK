"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Download, RefreshCw, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScrapePage() {
  const [sources, setSources] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [pages, setPages] = useState(3);

  const refresh = () => {
    api.listSources().then(setSources);
    api.listJobs().then(setJobs);
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  const run = async (source: string) => {
    setBusy(source);
    try {
      await api.startScrape(source, pages);
      refresh();
    } finally {
      setTimeout(() => setBusy(null), 1000);
    }
  };

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scrape Console</h1>
          <p className="text-ink-400 mt-1">
            Trigger scrapers per source. Each source uses a different tool.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-ink-300">Max pages</label>
          <input
            type="number"
            min={1}
            max={20}
            value={pages}
            onChange={(e) => setPages(parseInt(e.target.value || "1"))}
            className="w-20 bg-ink-800 border border-ink-700 rounded-lg px-3 py-1.5 text-sm"
          />
          <button onClick={refresh} className="btn-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {sources.map((s) => (
          <div key={s.key} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-400">{s.tool}</div>
                <div className="text-lg font-semibold mt-1">{s.name}</div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-500 mt-1 inline-block"
                >
                  {s.url}
                </a>
              </div>
              <button
                onClick={() => run(s.key)}
                disabled={busy === s.key}
                className={cn("btn-primary", busy === s.key && "opacity-60")}
              >
                {busy === s.key ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                Run
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Download size={16} /> Recent scrape jobs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-ink-400 text-xs uppercase tracking-wider">
              <tr className="border-b border-ink-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Source</th>
                <th className="text-left py-2 px-2">Tool</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Rows</th>
                <th className="text-left py-2 px-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-ink-700/50">
                  <td className="py-2 px-2 text-ink-400">#{j.id}</td>
                  <td className="py-2 px-2">{j.source}</td>
                  <td className="py-2 px-2 text-ink-300">{j.tool}</td>
                  <td className="py-2 px-2">
                    <span
                      className={cn(
                        "badge",
                        j.status === "completed" && "bg-emerald-500/15 text-emerald-300",
                        j.status === "running" && "bg-amber-500/15 text-amber-300",
                        j.status === "failed" && "bg-rose-500/15 text-rose-300",
                        j.status === "pending" && "bg-ink-700 text-ink-300"
                      )}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">{j.rows_scraped}</td>
                  <td className="py-2 px-2 text-ink-400">
                    {new Date(j.started_at).toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-400">
                    No jobs yet. Click Run above to start scraping.
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
