"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sparkles, FileDown, RefreshCw, ChevronRight, Rows3, Copy, TrendingDown, GitCompareArrows } from "lucide-react";
import { Stat } from "@/components/Stat";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtNum, cn } from "@/lib/utils";

const STEPS = [
  { key: "load", label: "Load raw", desc: "Query all uncleaned listings" },
  { key: "dedup", label: "Deduplicate", desc: "External-id + fuzzy match" },
  { key: "coerce", label: "Type coercion", desc: "Numeric / integer casts" },
  { key: "canon", label: "Canonicalise", desc: "Fuel + make aliases" },
  { key: "impute", label: "Impute region", desc: "From location fallback" },
  { key: "outliers", label: "Cap outliers", desc: "IQR method, 5th/95th %" },
];

export default function CleaningPage() {
  const [report, setReport] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getReport().then(setReport).catch(() => setReport(null));
  }, []);

  const run = async () => {
    setBusy(true);
    try {
      const r = await api.runCleaning();
      setReport(r);
    } finally {
      setBusy(false);
    }
  };

  const kept = report ? (report.rows_after / (report.rows_before || 1)) * 100 : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Data Preparation"
        title="Cleaning Pipeline"
        description="Deduplicate, coerce types, canonicalise categories, impute missing regions, and cap outliers using the IQR method."
        action={
          <>
            <button onClick={run} disabled={busy} className="btn-primary">
              {busy ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {busy ? "Running…" : "Run cleaning"}
            </button>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/cleaning/export`}
              className="btn-secondary"
            >
              <FileDown size={14} /> Export CSV
            </a>
          </>
        }
      />

      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <GitCompareArrows size={16} className="text-brand-300" /> Pipeline stages
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col gap-1 min-w-[130px]">
                <div className={cn(
                  "px-3 py-2.5 rounded-xl border text-sm font-medium transition",
                  report
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                    : "bg-white/5 border-white/10 text-ink-200"
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      report ? "bg-emerald-500 text-white" : "bg-white/10 text-ink-300"
                    )}>
                      {i + 1}
                    </span>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-ink-400 mt-1 pl-7">{step.desc}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={16} className="text-ink-500 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {!report ? (
        <EmptyState
          icon={Sparkles}
          title="No cleaning report yet"
          description="Scrape some data (or seed the demo) then click Run cleaning to see before/after stats, null diffs, and numeric summaries."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Rows before" value={fmtNum(report.rows_before)} icon={Rows3} accent="rose" />
            <Stat
              label="Rows after"
              value={fmtNum(report.rows_after)}
              hint={`${kept.toFixed(1)}% retained`}
              icon={Rows3}
              accent="emerald"
            />
            <Stat
              label="Duplicates removed"
              value={fmtNum(report.duplicates_removed)}
              icon={Copy}
              accent="amber"
            />
            <Stat
              label="Outliers capped"
              value={fmtNum(
                (report.outliers_capped?.price_gbp || 0) +
                  (report.outliers_capped?.mileage || 0)
              )}
              hint="price + mileage"
              icon={TrendingDown}
              accent="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Nulls — before / after</h3>
                <span className="text-xs text-ink-400">per column</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-ink-400 text-[11px] uppercase tracking-wider">
                    <tr className="border-b border-white/5">
                      <th className="text-left py-2">Column</th>
                      <th className="text-right py-2">Before</th>
                      <th className="text-right py-2">After</th>
                      <th className="text-right py-2 pr-2">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(report.nulls_before || {}).map((col) => {
                      const b = report.nulls_before[col] || 0;
                      const a = report.nulls_after[col] ?? 0;
                      const delta = b - a;
                      return (
                        <tr key={col} className="border-b border-white/[0.03]">
                          <td className="py-2 font-mono text-xs">{col}</td>
                          <td className="text-right text-rose-300 tabular-nums">{b}</td>
                          <td className="text-right text-emerald-300 tabular-nums">{a}</td>
                          <td className={cn(
                            "text-right pr-2 tabular-nums text-xs",
                            delta > 0 ? "text-emerald-300" : delta < 0 ? "text-rose-300" : "text-ink-400"
                          )}>
                            {delta > 0 ? `−${delta}` : delta}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Numeric summary (cleaned)</h3>
                <span className="text-xs text-ink-400">post-pipeline</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-ink-400 text-[11px] uppercase tracking-wider">
                    <tr className="border-b border-white/5">
                      <th className="text-left py-2">Column</th>
                      <th className="text-right py-2">Mean</th>
                      <th className="text-right py-2">Median</th>
                      <th className="text-right py-2">Min</th>
                      <th className="text-right py-2 pr-2">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.numeric_summary || {}).map(([col, s]: any) => (
                      <tr key={col} className="border-b border-white/[0.03]">
                        <td className="py-2 font-mono text-xs">{col}</td>
                        <td className="text-right tabular-nums">{fmtNum(s?.mean, 1)}</td>
                        <td className="text-right tabular-nums">{fmtNum(s?.median, 1)}</td>
                        <td className="text-right tabular-nums text-ink-300">{fmtNum(s?.min, 1)}</td>
                        <td className="text-right pr-2 tabular-nums text-ink-300">{fmtNum(s?.max, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
