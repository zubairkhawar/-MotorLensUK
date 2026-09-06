const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<{ status: string }>("/health"),

  listSources: () =>
    req<{ key: string; name: string; tool: string; url: string }[]>("/scrape/sources"),
  startScrape: (source: string, max_pages?: number) =>
    req("/scrape/run", { method: "POST", body: JSON.stringify({ source, max_pages }) }),
  listJobs: () => req<any[]>("/scrape/jobs"),

  runCleaning: () => req("/cleaning/run", { method: "POST" }),
  getReport: () => req<any>("/cleaning/report"),

  listings: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    }
    return req<any[]>(`/listings/?${q.toString()}`);
  },
  facets: () => req<{ makes: string[]; fuel_types: string[]; regions: string[] }>("/listings/facets"),

  edaSummary: () => req<any>("/eda/summary"),
  edaPriceDist: () => req<{ bins: number[]; counts: number[] }>("/eda/price-distribution"),
  edaTopMakes: () => req<{ label: string; value: number }[]>("/eda/top-makes"),
  edaTopModels: () => req<{ label: string; value: number }[]>("/eda/top-models"),
  edaFuelMix: () => req<{ label: string; value: number }[]>("/eda/fuel-mix"),
  edaFuelByYear: () => req<any[]>("/eda/fuel-mix-by-year"),
  edaDepreciation: () => req<{ x: number; y: number; label: string }[]>("/eda/depreciation"),
  edaPriceVsMileage: () => req<{ x: number; y: number; label: string }[]>("/eda/price-vs-mileage"),
  edaRegional: () => req<{ region: string; mean: number; median: number; count: number }[]>("/eda/regional-prices"),
  edaPriceByMake: () => req<any[]>("/eda/price-by-make"),

  ethicsPolicy: () => req<any>("/ethics/policy"),
  ethicsRobots: () => req<any[]>("/ethics/robots"),
};
