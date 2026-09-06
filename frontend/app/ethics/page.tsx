"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, ExternalLink, Clock, User, FileText, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Stat } from "@/components/Stat";

export default function EthicsPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);

  useEffect(() => {
    api.ethicsPolicy().then(setPolicy).catch(() => {});
    api.ethicsRobots().then(setRobots).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Ethics & Compliance"
        description="A transparent statement of how MotorLens UK scrapes, throttles, identifies itself, and respects target-site policies."
      />

      {policy && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat
              label="Request delay"
              value={`${policy.delay_between_requests_seconds}s`}
              hint="Between every HTTP request"
              icon={Clock}
              accent="brand"
            />
            <Stat
              label="Max pages / source"
              value={policy.max_pages_per_source}
              hint="Hard cap per scrape job"
              icon={FileText}
              accent="purple"
            />
            <Stat
              label="Identifying UA"
              value="Set"
              hint="Descriptive, contactable"
              icon={User}
              accent="emerald"
            />
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User size={16} className="text-brand-300" /> User-Agent string
            </h3>
            <div className="font-mono text-sm bg-ink-950/50 border border-white/5 rounded-lg p-3 text-ink-200 break-all">
              {policy.user_agent}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Principles observed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {policy.principles.map((p: string) => (
                <div key={p} className="flex gap-3 items-start p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-emerald-300" />
                  </div>
                  <span className="text-sm text-ink-200">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-300" />
          robots.txt status per target
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {robots.map((r) => (
            <div key={r.source} className="glass rounded-xl p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold capitalize">{r.source}</div>
                <span className={`badge ${
                  r.status === "reachable"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}>{r.status}</span>
              </div>
              <a
                href={r.robots_url}
                target="_blank" rel="noreferrer"
                className="text-xs text-brand-300 hover:text-brand-200 flex items-center gap-1 mb-3 truncate"
              >
                <ExternalLink size={12} /> {r.robots_url}
              </a>
              {r.snippet ? (
                <pre className="text-[10px] bg-ink-950/60 border border-white/5 rounded-lg p-2.5 max-h-36 overflow-auto text-ink-300 whitespace-pre-wrap font-mono">
                  {r.snippet}
                </pre>
              ) : (
                <div className="text-xs text-ink-400 italic">Snippet unavailable</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
