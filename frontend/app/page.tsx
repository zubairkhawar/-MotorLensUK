"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtGBP, fmtNum } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Car, Gauge, PoundSterling, Layers, Database,
  ArrowRight, TrendingUp, AlertCircle,
} from "lucide-react";

const COLORS = ["#3b6cf7", "#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#06b6d4", "#f43f5e"];

const tooltipStyle = {
  background: "rgba(36, 50, 88, 0.95)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  color: "#e6ecfa",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [topMakes, setTopMakes] = useState<any[]>([]);
  const [fuelMix, setFuelMix] = useState<any[]>([]);
  const [regional, setRegional] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.edaSummary(),
      api.edaTopMakes(15),
      api.edaFuelMix(),
      api.edaRegional(),
    ])
      .then(([s, m, f, r]) => {
        setSummary(s);
        setTopMakes(m);
        setFuelMix(f);
        setRegional(r);
        setErr(null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const isEmpty = !loading && summary?.total_listings === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="UK Automotive Market Intelligence"
        description="Live scraping across AutoTrader, Cinch and Heycar, cleaned with a reproducible pandas pipeline, then explored through interactive analytics."
        gradient
      />

      {err && (
        <div className="card border-rose-500/40 bg-rose-500/10 text-rose-200 flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <div>
            <div className="font-semibold">Backend unreachable</div>
            <div className="text-sm opacity-80">{err} — start FastAPI on port 8000.</div>
          </div>
        </div>
      )}

      {isEmpty && !err && (
        <EmptyState
          icon={Database}
          title="No data yet"
          description="Trigger scrapers from the Scrape console to pull real UK listings from AutoTrader, Cinch, and Heycar."
          action={
            <Link href="/scrape" className="btn-primary">
              Open Scrape console <ArrowRight size={14} />
            </Link>
          }
        />
      )}

      {!isEmpty && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Listings" value={fmtNum(summary?.total_listings)} icon={Car} accent="brand" loading={loading} />
            <Stat label="Unique Makes" value={fmtNum(summary?.unique_makes)} hint={`${fmtNum(summary?.unique_models)} models`} icon={Layers} accent="purple" loading={loading} />
            <Stat label="Median Price" value={fmtGBP(summary?.median_price)} hint={`avg ${fmtGBP(summary?.avg_price)}`} icon={PoundSterling} accent="emerald" loading={loading} />
            <Stat label="Avg Mileage" value={fmtNum(summary?.avg_mileage)} hint="miles" icon={Gauge} accent="amber" loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Top 15 makes"
              subtitle="Listing counts across all sources"
              action={<Link href="/eda" className="btn-ghost text-xs">More <ArrowRight size={12} /></Link>}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMakes} layout="vertical" margin={{ left: 10 }}>
                  <defs>
                    <linearGradient id="grad-brand" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b6cf7" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" stroke="#8091b3" fontSize={11} />
                  <YAxis type="category" dataKey="label" stroke="#8091b3" fontSize={11} width={100} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" fill="url(#grad-brand)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Fuel-type mix" subtitle="Share of the sampled market">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fuelMix} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} stroke="none">
                    {fuelMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: "#c8d0e4", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Regional pricing"
              subtitle="Mean listing price by UK region"
              action={<span className="badge bg-emerald-500/15 text-emerald-300"><TrendingUp size={10} /> avg</span>}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regional}>
                  <XAxis dataKey="region" stroke="#8091b3" fontSize={9} angle={-30} textAnchor="end" height={80} />
                  <YAxis stroke="#8091b3" fontSize={11} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => fmtGBP(v)} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="mean" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Source coverage" subtitle="Listings scraped per source">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(summary?.sources || {}).map(([k, v]) => ({ source: k, value: v }))}>
                  <XAxis dataKey="source" stroke="#8091b3" fontSize={12} />
                  <YAxis stroke="#8091b3" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
