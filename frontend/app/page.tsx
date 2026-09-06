"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Stat } from "@/components/Stat";
import { ChartCard } from "@/components/ChartCard";
import { fmtGBP, fmtNum } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b6cf7", "#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#06b6d4", "#f43f5e"];

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [topMakes, setTopMakes] = useState<any[]>([]);
  const [fuelMix, setFuelMix] = useState<any[]>([]);
  const [regional, setRegional] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
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
      })
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">MotorLens UK — Automotive Market Intelligence</h1>
        <p className="text-ink-400 mt-1">
          Scraped listings across 3 UK sources · cleaned · exploratory analytics
        </p>
      </header>

      {err && (
        <div className="card border-rose-500/40 bg-rose-500/10 text-rose-200 mb-6">
          Backend not reachable: {err}. Start the FastAPI server on port 8000.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Listings" value={fmtNum(summary?.total_listings)} />
        <Stat label="Unique Makes" value={fmtNum(summary?.unique_makes)} />
        <Stat label="Median Price" value={fmtGBP(summary?.median_price)} />
        <Stat label="Avg Mileage" value={fmtNum(summary?.avg_mileage)} hint="miles" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 15 makes" subtitle="Listing counts across all sources">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMakes} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" stroke="#8091b3" fontSize={11} />
              <YAxis type="category" dataKey="label" stroke="#8091b3" fontSize={11} width={100} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#3b6cf7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuel-type mix" subtitle="Share of the sampled market">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fuelMix}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {fuelMix.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: "#c8d0e4", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Regional pricing"
          subtitle="Mean listing price by UK region"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regional}>
              <XAxis dataKey="region" stroke="#8091b3" fontSize={10} angle={-30} textAnchor="end" height={70} />
              <YAxis stroke="#8091b3" fontSize={11} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }}
                formatter={(v: any) => fmtGBP(v)}
              />
              <Bar dataKey="mean" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Source coverage" subtitle="Listings per scraper source">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(summary?.sources || {}).map(([k, v]) => ({
                source: k, value: v,
              }))}
            >
              <XAxis dataKey="source" stroke="#8091b3" fontSize={12} />
              <YAxis stroke="#8091b3" fontSize={11} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
