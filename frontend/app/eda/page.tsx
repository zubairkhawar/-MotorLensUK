"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChartCard } from "@/components/ChartCard";
import { fmtGBP } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
  AreaChart, Area, Legend,
} from "recharts";

const COLORS = ["#3b6cf7", "#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#06b6d4", "#f43f5e"];

export default function EDAPage() {
  const [priceDist, setPriceDist] = useState<any>(null);
  const [topModels, setTopModels] = useState<any[]>([]);
  const [fuelByYear, setFuelByYear] = useState<any[]>([]);
  const [depreciation, setDepreciation] = useState<any[]>([]);
  const [priceMileage, setPriceMileage] = useState<any[]>([]);
  const [priceByMake, setPriceByMake] = useState<any[]>([]);

  useEffect(() => {
    api.edaPriceDist().then(setPriceDist);
    api.edaTopModels(20).then(setTopModels);
    api.edaFuelByYear().then(setFuelByYear);
    api.edaDepreciation().then(setDepreciation);
    api.edaPriceVsMileage().then(setPriceMileage);
    api.edaPriceByMake().then(setPriceByMake);
  }, []);

  const priceHist = priceDist
    ? priceDist.bins.map((b: number, i: number) => ({ price: b, count: priceDist.counts[i] }))
    : [];

  const fuelKeys = Array.from(
    new Set(fuelByYear.flatMap((r: any) => Object.keys(r).filter((k) => k !== "year")))
  );

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Exploratory Data Analysis</h1>
        <p className="text-ink-400 mt-1">Interactive charts over the cleaned dataset.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Price distribution" subtitle="Histogram of listing prices">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceHist}>
              <XAxis
                dataKey="price"
                stroke="#8091b3"
                fontSize={10}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <YAxis stroke="#8091b3" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }}
                labelFormatter={(v) => fmtGBP(Number(v))}
              />
              <Bar dataKey="count" fill="#3b6cf7" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 20 models" subtitle="By listing count">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topModels} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" stroke="#8091b3" fontSize={11} />
              <YAxis type="category" dataKey="label" stroke="#8091b3" fontSize={10} width={140} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuel-type mix by year" subtitle="Stacked area — track EV growth">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fuelByYear}>
              <XAxis dataKey="year" stroke="#8091b3" fontSize={11} />
              <YAxis stroke="#8091b3" fontSize={11} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: "#c8d0e4", fontSize: 12 }} />
              {fuelKeys.map((k, i) => (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stackId="1"
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.7}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Depreciation curve" subtitle="Price vs vehicle age">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <XAxis type="number" dataKey="x" name="Age (years)" stroke="#8091b3" fontSize={11} />
              <YAxis
                type="number"
                dataKey="y"
                name="Price"
                stroke="#8091b3"
                fontSize={11}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <ZAxis range={[40, 40]} />
              <Tooltip
                contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }}
                formatter={(v: any, n: string) => (n === "y" ? fmtGBP(v) : v)}
              />
              <Scatter data={depreciation} fill="#ec4899" fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Price vs mileage" subtitle="Scatter (sampled)">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <XAxis type="number" dataKey="x" name="Mileage" stroke="#8091b3" fontSize={11} />
              <YAxis
                type="number"
                dataKey="y"
                name="Price"
                stroke="#8091b3"
                fontSize={11}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <ZAxis range={[30, 30]} />
              <Tooltip
                contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }}
                formatter={(v: any, n: string) => (n === "y" ? fmtGBP(v) : v)}
              />
              <Scatter data={priceMileage} fill="#22c55e" fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Price spread by make" subtitle="IQR (Q1–Q3), median line">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceByMake}>
              <XAxis dataKey="make" stroke="#8091b3" fontSize={10} angle={-30} textAnchor="end" height={70} />
              <YAxis stroke="#8091b3" fontSize={11} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111a2e", border: "1px solid #1a2440", borderRadius: 8 }}
                formatter={(v: any) => fmtGBP(v)}
              />
              <Bar dataKey="q1" stackId="a" fill="transparent" />
              <Bar dataKey="median" stackId="a" fill="#f59e0b" />
              <Bar dataKey="q3" stackId="a" fill="#3b6cf7" fillOpacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
