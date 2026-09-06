"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sparkles, FileDown, RefreshCw } from "lucide-react";
import { Stat } from "@/components/Stat";
import { fmtNum } from "@/lib/utils";

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

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cleaning Pipeline</h1>
          <p className="text-ink-400 mt-1">
            Deduplicate, coerce types, canonicalise categories, cap outliers.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={run} disabled={busy} className="btn-primary">
            {busy ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Run cleaning
          </button>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/cleaning/export`}
            className="btn-secondary"
          >
            <FileDown size={14} /> Export CSV
          </a>
        </div>
      </header>

      {!report && (
        <div className="card text-ink-400">
          No cleaning report yet. Run the pipeline after scraping to see stats.
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat label="Rows before" value={fmtNum(report.rows_before)} />
            <Stat label="Rows after" value={fmtNum(report.rows_after)} />
            <Stat label="Duplicates removed" value={fmtNum(report.duplicates_removed)} />
            <Stat
              label="Outliers capped"
              value={fmtNum(
                (report.outliers_capped?.price_gbp || 0) +
                  (report.outliers_capped?.mileage || 0)
              )}
              hint="price + mileage combined"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="font-semibold mb-3">Nulls — before / after</h3>
              <table className="w-full text-sm">
                <thead className="text-ink-400 text-xs uppercase">
                  <tr className="border-b border-ink-700">
                    <th className="text-left py-1">Column</th>
                    <th className="text-right py-1">Before</th>
                    <th className="text-right py-1">After</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(report.nulls_before || {}).map((col) => (
                    <tr key={col} className="border-b border-ink-700/40">
                      <td className="py-1.5">{col}</td>
                      <td className="text-right text-rose-300">{report.nulls_before[col]}</td>
                      <td className="text-right text-emerald-300">
                        {report.nulls_after[col] ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Numeric summary (cleaned)</h3>
              <table className="w-full text-sm">
                <thead className="text-ink-400 text-xs uppercase">
                  <tr className="border-b border-ink-700">
                    <th className="text-left py-1">Column</th>
                    <th className="text-right py-1">Mean</th>
                    <th className="text-right py-1">Median</th>
                    <th className="text-right py-1">Min</th>
                    <th className="text-right py-1">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.numeric_summary || {}).map(([col, s]: any) => (
                    <tr key={col} className="border-b border-ink-700/40">
                      <td className="py-1.5">{col}</td>
                      <td className="text-right">{fmtNum(s.mean, 1)}</td>
                      <td className="text-right">{fmtNum(s.median, 1)}</td>
                      <td className="text-right">{fmtNum(s.min, 1)}</td>
                      <td className="text-right">{fmtNum(s.max, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
