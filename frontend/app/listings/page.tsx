"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtGBP, fmtNum, cn } from "@/lib/utils";
import { Table, RefreshCw, Filter, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 25;

export default function ListingsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [facets, setFacets] = useState<{ makes: string[]; fuel_types: string[]; regions: string[] }>({
    makes: [], fuel_types: [], regions: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<any>({
    make: "", fuel_type: "", year_min: "", year_max: "",
    price_min: "", price_max: "",
  });

  const load = () => {
    setLoading(true);
    api
      .listings({ ...filters, limit: 500 })
      .then(setRows)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.facets().then(setFacets).catch(() => {});
    load();
  }, []);

  const paged = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Data"
        title="Listings browser"
        description="Explore the cleaned inventory across all sources with filtering and pagination."
        action={
          <button onClick={load} className="btn-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-brand-300" />
          <span className="font-semibold text-sm">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <select
            value={filters.make}
            onChange={(e) => setFilters({ ...filters, make: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          >
            <option value="">All makes</option>
            {facets.makes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={filters.fuel_type}
            onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          >
            <option value="">All fuel types</option>
            {facets.fuel_types.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <input
            type="number" placeholder="Year from"
            value={filters.year_min}
            onChange={(e) => setFilters({ ...filters, year_min: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
          <input
            type="number" placeholder="Year to"
            value={filters.year_max}
            onChange={(e) => setFilters({ ...filters, year_max: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
          <input
            type="number" placeholder="Price min"
            value={filters.price_min}
            onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
          <input
            type="number" placeholder="Price max"
            value={filters.price_max}
            onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={() => { setPage(0); load(); }} className="btn-primary">
            Apply filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card animate-shimmer h-96" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Table}
          title="No listings match"
          description="Try clearing filters or seed the database from the Dashboard."
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="text-sm text-ink-300">
              <span className="font-semibold text-white">{fmtNum(rows.length)}</span> listings
              {rows.length > PAGE_SIZE && (
                <span className="text-ink-400"> · showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-ink-400 tabular-nums">{page + 1} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
                className="btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-ink-400 text-[11px] uppercase tracking-wider bg-white/[0.02]">
                <tr>
                  <th className="text-left py-3 px-5">Make · Model</th>
                  <th className="text-right py-3 px-3">Year</th>
                  <th className="text-right py-3 px-3">Price</th>
                  <th className="text-right py-3 px-3">Mileage</th>
                  <th className="text-left py-3 px-3">Fuel</th>
                  <th className="text-left py-3 px-3">Trans</th>
                  <th className="text-left py-3 px-3">Region</th>
                  <th className="text-left py-3 px-3">Source</th>
                  <th className="text-right py-3 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-5">
                      <div className="font-medium text-white">{r.make}</div>
                      <div className="text-xs text-ink-400">{r.model}</div>
                    </td>
                    <td className="text-right px-3 tabular-nums">{r.year ?? "—"}</td>
                    <td className="text-right px-3 tabular-nums font-semibold text-brand-200">{fmtGBP(r.price_gbp)}</td>
                    <td className="text-right px-3 tabular-nums text-ink-300">{fmtNum(r.mileage)}</td>
                    <td className="px-3">
                      <span className={cn("badge",
                        r.fuel_type === "Electric" && "bg-emerald-500/15 text-emerald-300",
                        r.fuel_type === "Hybrid" && "bg-cyan-500/15 text-cyan-300",
                        r.fuel_type === "Plug-in Hybrid" && "bg-teal-500/15 text-teal-300",
                        r.fuel_type === "Petrol" && "bg-amber-500/15 text-amber-300",
                        r.fuel_type === "Diesel" && "bg-rose-500/15 text-rose-300",
                      )}>{r.fuel_type}</span>
                    </td>
                    <td className="px-3 text-ink-300">{r.transmission}</td>
                    <td className="px-3 text-ink-300">{r.region}</td>
                    <td className="px-3 text-ink-400 font-mono text-xs">{r.source}</td>
                    <td className="text-right px-5">
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-ink-400 hover:text-brand-300">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
