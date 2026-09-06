"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { fmtGBP } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, CartesianGrid,
  AreaChart, Area, Legend,
} from "recharts";

const COLORS = ["#3b6cf7", "#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#06b6d4", "#f43f5e"];

const tooltipStyle = {
  background: "rgba(36, 50, 88, 0.95)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  color: "#e6ecfa",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export default function EDAPage() {
  const [priceDist, setPriceDist] = useState<any>(null);
  const [topModels, setTopModels] = useState<any[]>([]);
  const [fuelByYear, setFuelByYear] = useState<any[]>([]);
  const [depreciation, setDepreciation] = useState<any[]>([]);
  const [priceMileage, setPriceMileage] = useState<any[]>([]);
  const [priceByMake, setPriceByMake] = useState<any[]>([]);
  const [regional, setRegional] = useState<any[]>([]);

  useEffect(() => {
    api.edaPriceDist().then(setPriceDist);
    api.edaTopModels(20).then(setTopModels);
    api.edaFuelByYear().then(setFuelByYear);
    api.edaDepreciation().then(setDepreciation);
    api.edaPriceVsMileage().then(setPriceMileage);
    api.edaPriceByMake().then(setPriceByMake);
    api.edaRegional().then(setRegional);
  }, []);

  const priceHist = priceDist
    ? priceDist.bins.map((b: number, i: number) => ({ price: b, count: priceDist.counts[i] }))
    : [];

  const fuelKeys = Array.from(
    new Set(fuelByYear.flatMap((r: any) => Object.keys(r).filter((k) => k !== "year")))
  );

  const boxData = priceByMake.map((row: any) => ({
    make: row.make,
    lo: row.q1,
    band: row.q3 - row.q1,
    median: row.median,
    minTick: row.min,
    maxTick: row.max,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analysis"
        title="Exploratory Data Analysis"
        description="Seven interactive views over the cleaned dataset — distributions, top-N, trends, scatterplots, and IQR bands by make."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Price distribution" subtitle="Histogram — 30 bins across cleaned prices">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceHist}>
              <defs>
                <linearGradient id="grad-price" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b6cf7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b6cf7" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="price" stroke="#8091b3" fontSize={10}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <YAxis stroke="#8091b3" fontSize={11} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(v) => fmtGBP(Number(v))}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" fill="url(#grad-price)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 20 models" subtitle="Listing count by make + model">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topModels} layout="vertical" margin={{ left: 10 }}>
              <defs>
                <linearGradient id="grad-model" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <XAxis type="number" stroke="#8091b3" fontSize={11} />
              <YAxis type="category" dataKey="label" stroke="#8091b3" fontSize={10} width={140} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" fill="url(#grad-model)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuel-type mix by year" subtitle="Stacked area — track EV adoption">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fuelByYear}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="#8091b3" fontSize={11} />
              <YAxis stroke="#8091b3" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#c8d0e4", fontSize: 12 }} iconType="circle" />
              {fuelKeys.map((k, i) => (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stackId="1"
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Depreciation curve" subtitle="Price vs vehicle age — 500-row sample">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="Age (years)" stroke="#8091b3" fontSize={11} />
              <YAxis
                type="number" dataKey="y" name="Price" stroke="#8091b3" fontSize={11}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <ZAxis range={[40, 40]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any, n: string) => (n === "y" ? fmtGBP(v) : v)}
                cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }}
              />
              <Scatter data={depreciation} fill="#ec4899" fillOpacity={0.55} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Price vs mileage" subtitle="Colour hints fuel type">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="Mileage" stroke="#8091b3" fontSize={11} />
              <YAxis
                type="number" dataKey="y" name="Price" stroke="#8091b3" fontSize={11}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <ZAxis range={[30, 30]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any, n: string) => (n === "y" ? fmtGBP(v) : v)}
                cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }}
              />
              <Scatter data={priceMileage} fill="#22c55e" fillOpacity={0.55} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Price spread by make" subtitle="Q1–Q3 band with median marker">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boxData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="make" stroke="#8091b3" fontSize={10} angle={-30} textAnchor="end" height={80} />
              <YAxis stroke="#8091b3" fontSize={11} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => fmtGBP(v)} />
              <Bar dataKey="lo" stackId="box" fill="transparent" />
              <Bar dataKey="band" stackId="box" fill="#3b6cf7" fillOpacity={0.6} radius={[2, 2, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Regional pricing"
          subtitle="Mean + median per UK region"
          height="h-72"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regional}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="region" stroke="#8091b3" fontSize={10} angle={-30} textAnchor="end" height={80} />
              <YAxis stroke="#8091b3" fontSize={11} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => fmtGBP(v)} />
              <Legend wrapperStyle={{ color: "#c8d0e4", fontSize: 12 }} iconType="circle" />
              <Bar dataKey="mean" fill="#22c55e" radius={[4, 4, 0, 0]} name="Mean" />
              <Bar dataKey="median" fill="#3b6cf7" radius={[4, 4, 0, 0]} name="Median" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card">
          <h3 className="font-semibold mb-3">EDA methodology</h3>
          <ul className="text-sm text-ink-300 space-y-2 list-disc pl-5">
            <li>Distributions computed from post-cleaning listings only</li>
            <li>Scatter plots sample 500 rows (deterministic seed) for readability</li>
            <li>Regional aggregates use mean and median to expose skew</li>
            <li>IQR bands show Q1–Q3; markers show median</li>
            <li>Fuel-mix-by-year uses stacked areas to visualise EV growth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
