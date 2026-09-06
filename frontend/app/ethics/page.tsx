"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function EthicsPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);

  useEffect(() => {
    api.ethicsPolicy().then(setPolicy);
    api.ethicsRobots().then(setRobots);
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck /> Ethics & Compliance
        </h1>
        <p className="text-ink-400 mt-1">
          Transparent statement of how this project scrapes, throttles, and identifies itself.
        </p>
      </header>

      {policy && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Scraping policy</h2>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <dt className="stat-label">User-Agent</dt>
              <dd className="text-sm mt-1 font-mono text-ink-200 break-all">{policy.user_agent}</dd>
            </div>
            <div>
              <dt className="stat-label">Delay between requests</dt>
              <dd className="stat-value">{policy.delay_between_requests_seconds}s</dd>
            </div>
            <div>
              <dt className="stat-label">Max pages per source</dt>
              <dd className="stat-value">{policy.max_pages_per_source}</dd>
            </div>
          </dl>
          <h3 className="font-semibold mb-2">Principles</h3>
          <ul className="text-sm text-ink-200 space-y-1.5 list-disc pl-5">
            {policy.principles.map((p: string) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">robots.txt status per target</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {robots.map((r) => (
            <div key={r.source} className="border border-ink-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{r.source}</div>
                <span
                  className={`badge ${
                    r.status === "reachable"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.robots_url && (
                <a
                  href={r.robots_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-500 flex items-center gap-1 mb-2"
                >
                  <ExternalLink size={12} /> {r.robots_url}
                </a>
              )}
              {r.snippet && (
                <pre className="text-[10px] bg-ink-900 border border-ink-700 rounded p-2 max-h-40 overflow-auto text-ink-300 whitespace-pre-wrap">
                  {r.snippet}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
