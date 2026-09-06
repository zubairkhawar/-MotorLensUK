"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtGBP, fmtNum, cn } from "@/lib/utils";
import {
  Table, RefreshCw, Filter, ExternalLink, ChevronLeft, ChevronRight,
  Gauge, Fuel, Calendar, MapPin, Search, X, Car,
} from "lucide-react";

const PAGE_SIZE = 24;

type Filters = {
  make: string;
  fuel_type: string;
  year_min: string;
  year_max: string;
  price_min: string;
  price_max: string;
  q: string;
};

const EMPTY: Filters = {
  make: "", fuel_type: "", year_min: "", year_max: "",
  price_min: "", price_max: "", q: "",
};

export default function ListingsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [facets, setFacets] = useState<{ makes: string[]; fuel_types: string[]; regions: string[] }>({
    makes: [], fuel_types: [], regions: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Filters>(EMPTY);

  const load = () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (filters.make) params.make = filters.make;
    if (filters.fuel_type) params.fuel_type = filters.fuel_type;
    if (filters.year_min) params.year_min = filters.year_min;
    if (filters.year_max) params.year_max = filters.year_max;
    if (filters.price_min) params.price_min = filters.price_min;
    if (filters.price_max) params.price_max = filters.price_max;
    params.limit = 1000;
    api.listings(params).then((data) => {
      setRows(data);
      setPage(0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.facets().then(setFacets).catch(() => {});
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!filters.q) return rows;
    const q = filters.q.toLowerCase();
    return rows.filter((r) =>
      (r.make || "").toLowerCase().includes(q) ||
      (r.model || "").toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q)
    );
  }, [rows, filters.q]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const clearFilters = () => { setFilters(EMPTY); setTimeout(load, 0); };
  const hasFilters = Object.entries(filters).some(([k, v]) => v && k !== "q");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings browser"
        description="Real UK car listings scraped from AutoTrader, Cinch and Heycar — with images."
        action={
          <button onClick={load} className="btn-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-300" />
            <span className="font-semibold text-sm">Filters</span>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-xs">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="lg:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text" placeholder="Search make, model…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm ring-focus"
            />
          </div>
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
            <option value="">All fuel</option>
            {facets.fuel_types.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <input
            type="number" placeholder="Year min"
            value={filters.year_min}
            onChange={(e) => setFilters({ ...filters, year_min: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
          <input
            type="number" placeholder="£ min"
            value={filters.price_min}
            onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
          <input
            type="number" placeholder="£ max"
            value={filters.price_max}
            onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm ring-focus"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={load} className="btn-primary">
            <Filter size={14} /> Apply filters
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-300">
          <span className="font-semibold text-white">{fmtNum(filtered.length)}</span>{" "}
          {filtered.length === 1 ? "listing" : "listings"}
          {filtered.length > PAGE_SIZE && (
            <span className="text-ink-400"> · showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}</span>
          )}
        </div>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost p-1.5 disabled:opacity-30"
            ><ChevronLeft size={16} /></button>
            <span className="text-xs text-ink-400 tabular-nums">{page + 1} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="btn-ghost p-1.5 disabled:opacity-30"
            ><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-shimmer h-80" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Table}
          title="No listings match"
          description="Try clearing filters or trigger a scrape from the Scrape console."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paged.map((r) => (
            <ListingCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ row }: { row: any }) {
  const fuelClass =
    row.fuel_type === "Electric" ? "bg-emerald-500/15 text-emerald-300" :
    row.fuel_type === "Hybrid" ? "bg-cyan-500/15 text-cyan-300" :
    row.fuel_type === "Plug-in Hybrid" ? "bg-teal-500/15 text-teal-300" :
    row.fuel_type === "Petrol" ? "bg-amber-500/15 text-amber-300" :
    row.fuel_type === "Diesel" ? "bg-rose-500/15 text-rose-300" :
    "bg-white/5 text-ink-300";

  return (
    <a
      href={row.url || "#"}
      target={row.url ? "_blank" : undefined}
      rel="noreferrer"
      className="card card-hover group !p-0 overflow-hidden flex flex-col animate-slide-up"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-ink-800 to-ink-900 overflow-hidden">
        {row.image_url ? (
          <img
            src={row.image_url}
            alt={row.title || `${row.make} ${row.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.currentTarget.style.display = "none"); }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-500">
            <Car size={40} />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className={cn("badge", fuelClass)}>{row.fuel_type || "N/A"}</span>
        </div>
        <div className="absolute bottom-2 left-2 badge bg-ink-950/80 text-white border border-white/10">
          {row.source}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="font-bold text-white truncate">{row.make} {row.model}</div>
            <div className="text-xs text-ink-400 truncate">{row.title}</div>
          </div>
        </div>
        <div className="text-2xl font-bold text-brand-200 mb-3 tabular-nums">
          {fmtGBP(row.price_gbp)}
        </div>
        <div className="grid grid-cols-2 gap-y-1.5 text-xs text-ink-300 mt-auto">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-ink-400" /> {row.year || "—"}
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge size={12} className="text-ink-400" /> {fmtNum(row.mileage)} mi
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Fuel size={12} className="text-ink-400" /> {row.transmission || "—"}
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={12} className="text-ink-400" /> {row.region || row.location || "UK"}
          </div>
        </div>
        {row.url && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-ink-400">View on {row.source}</span>
            <ExternalLink size={12} className="text-brand-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>
    </a>
  );
}
