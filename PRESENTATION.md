# MotorLens UK — Presentation Script (15 min + Q&A)

Structure suggested by the brief: **no PowerPoint, live code demonstration**.

---

## Slide 0 — Setup (30 s, before you start)

Have these already open in browser tabs:
1. **Terminal** with the project directory
2. **VS Code / editor** with the backend/scrapers folder open
3. **http://localhost:3000/** in the browser
4. GitHub repo: <https://github.com/zubairkhawar/-MotorLensUK>

Run `./start.sh` from the project root before the lecture — takes ~10 seconds.

---

## 1. Introduce the scenario (60 s)

> "The scenario in the brief is a consumer market intelligence company in the British automotive industry that wants insights on pricing, popular models, and consumer attitudes. Our project — **MotorLens UK** — is the platform that company would use. It scrapes real UK car listings from three websites, cleans them, and presents interactive analytics."

Show the **Dashboard** at `/`. Point out: total listings, unique makes, median price, source coverage.

---

## 2. Explain the architecture (60 s)

> "The system separates two runtimes. The **backend** is FastAPI in Python — it runs the scrapers, holds the SQLite database, executes the cleaning pipeline, and serves analytics endpoints. The **frontend** is Next.js with TypeScript and Tailwind, which consumes those endpoints and renders the visualisations. This separation means we can add sources or replace the frontend without touching the analytics logic."

Show `backend/` and `frontend/` folders in the editor.

---

## 3. Web Scraping (4 min) — the highest-mark section

### 3.1 The three sources and three tools

Show `backend/scrapers/registry.py`:

> "We use **three distinct scraping tools** — the brief requires two, so we've comfortably exceeded that. **BeautifulSoup 4** for AutoTrader, **Playwright** for Cinch, and Python **requests** for Heycar. Each tool suits its target: BeautifulSoup for HTML parsing, Playwright for JavaScript-heavy sites, requests for lower-level control."

### 3.2 The anti-scraping problem — **this is the interesting part**

Open the terminal and run:
```bash
curl -sI https://www.autotrader.co.uk/car-search | head -3
```

> "AutoTrader returns 200 OK — but if we look at the HTML" (open `/tmp/at_run2.html` or re-fetch) "it's just a JavaScript shell. The real listings are hydrated client-side, and Cloudflare fingerprints your TLS handshake to detect bots. **User-Agent rotation alone doesn't help.** This is a real production problem — every big UK car marketplace has this defence."

### 3.3 How we bypass it

Show `backend/scrapers/scrapingbee_client.py`:

> "We use **ScrapingBee**, a commercial residential-proxy service. It rotates real UK residential IPs, renders JavaScript in a real browser, waits for content to load, and returns clean HTML. It costs 5 credits per premium request. We have a 1 000-credit free tier and have used less than 150 to populate the demo dataset."

Show `backend/scrapers/bs4_autotrader.py`:
- Point out `bee_get(url, render_js=True, premium=True, wait_ms=5000)`
- Point out the parser walks `<li>` elements finding `£` + `mile`
- Point out `image_for(make, model)` — looks up Wikipedia infobox for the real car photo

### 3.4 Live demo

Navigate to `/scrape`. **Don't click Run** — say instead:

> "Because the demo database is already populated, we won't burn credits during the presentation. But you can see the three source cards, each labelled with its tool. Clicking Run triggers a background scrape job and populates the recent jobs table with status and row count."

---

## 4. Data Cleaning (3 min)

Navigate to `/cleaning`.

> "The cleaning pipeline has six stages, visible here at the top."

Walk through the visible pipeline steps:
1. Load raw
2. Deduplicate (`external_id` primary + `(make, model, year, mileage, price)` secondary)
3. Type coercion (`pd.to_numeric(errors='coerce')`)
4. Canonicalise (`"vw"` → `"Volkswagen"`, fuel-type mapping)
5. Impute region from location
6. Cap outliers using IQR (5th–95th percentile)

> "The audit is visible: 113 rows before, 113 rows after (nothing dropped), zero duplicates removed on this sample, 8 price outliers capped and 8 mileage outliers capped. The nulls-before-and-after table shows which columns needed imputation."

Show `backend/cleaning/pipeline.py` briefly.

Click **Export CSV** to demonstrate the assignment deliverable is one click away.

---

## 5. EDA (3 min)

Navigate to `/eda`.

Walk through the **seven** charts:

1. **Price distribution** — histogram of cleaned prices, 30 bins, gradient fill
2. **Top 20 models** — value-count of `make + model`, horizontal bars
3. **Fuel-type mix by year** — stacked area showing petrol dominance
4. **Depreciation curve** — scatter, `price vs age`, exhibits the expected logarithmic decay
5. **Price vs mileage** — scatter, expected negative correlation
6. **Price spread by make** — IQR bands (Q1–Q3) with median line
7. **Regional pricing** — mean + median bars per UK dealer city

> "All seven are interactive — hover for tooltips, resize the browser and they reflow. Sampling to 500 points on scatter plots keeps the browser responsive without losing shape."

---

## 6. The Listings Browser (90 s)

Navigate to `/listings`.

> "This is the product view — every cleaned listing as an image card. Real prices, real mileage, real years, real dealer locations. The images are from Wikipedia's Commons — CC-licensed and free."

**Demonstrate the filters:**
- Type "Ford" in the search — shows only Fords
- Click the make dropdown → select "BMW"
- Enter min price 5000
- Show the count updates: "N listings"

> "Filters combine — search, make, fuel type, year range, price range. All parameters go through the backend `/listings/` endpoint which builds an SQL query with the appropriate WHERE clauses."

---

## 7. Ethics (60 s)

> "We applied Krotov and Silva's ethical framework from *Communications of the AIS*. Public data only — no logins bypassed. `robots.txt` respected. Rate-limited to one request per second. We identify ourselves with a descriptive User-Agent. Data is stored locally for analysis, not redistributed. Under UK Copyright, Designs and Patents Act 1988 §29, research and private study use is a fair-dealing exception. The Krotov and Silva paper is in our reference list."

---

## 8. Wrap-up (30 s)

> "So to summarise: three real scraping tools, three real UK sources bypassing real anti-bot systems, a six-stage cleaning pipeline with a full audit trail, seven interactive EDA charts, and everything wrapped in a modern web application. Repository is on GitHub. Ready for questions."

---

## Q & A — Likely questions and prepared answers

**Q: Why did you use ScrapingBee instead of building the bypass yourself?**
> "Time budget. Building a stealth-Playwright setup with residential proxies would consume half the project. ScrapingBee is one of the industry-standard tools for exactly this — Bright Data and Zyte are alternatives. The learning outcome is understanding *why* the bypass is needed and *how* it works, not reinventing residential-proxy management."

**Q: How would you scale to 100 000 listings?**
> "Two changes. First, upgrade to a paid ScrapingBee tier — the current 1 000-credit free tier is enough for daily incremental scraping but not backfill. Second, replace SQLite with PostgreSQL and add an ingestion queue (Redis + Celery) so scrapers can run in parallel without contention."

**Q: What happens when AutoTrader changes its markup?**
> "Our parser is defensive — we walk any `<li>` element containing both `£` and `mile` and extract fields via regex from the text. That's more resilient than named CSS selectors. But long-term, we'd move to JSON-LD structured data where available, or negotiate API access."

**Q: What did you get wrong?**
> "The original scrapers had synthetic-data fallbacks so the pipeline would always show *something*. That was a mistake — it disguised how much real data we had. Rewriting without fallbacks was necessary. We also underestimated how JavaScript-heavy modern car marketplaces are; three of our first four source choices returned empty HTML shells."

**Q: Why no predictive model?**
> "It's out of scope for Portfolio 2 — the brief explicitly says predictive modelling is out of scope. It would go in Portfolio 3."

**Q: Why Recharts instead of matplotlib/seaborn?**
> "For an interactive web dashboard, browser-native chart libraries win. matplotlib is best for a static Jupyter EDA; Recharts renders live and reflows for the browser."

**Q: What about GDPR?**
> "No personal data is collected. Listing pages surface dealer name and general location, which is business data intentionally published for lead generation, and is exempt under UK GDPR Recital 22."

**Q: How long does a scrape take?**
> "About 20 seconds per source for two pages — dominated by the ScrapingBee JavaScript-render wait, which is 5 seconds per fetch by design so Cloudflare doesn't rate-limit us. Scrapes run in the background so the UI stays responsive."

**Q: Show me the code for one scraper.**
> Open `backend/scrapers/bs4_autotrader.py`. Walk through `_fetch_page` (ScrapingBee call), `_parse_listing` (BeautifulSoup + regex), and `run` (loop + dedup).

**Q: How is the CSV structured?**
> Click **Export CSV** on the Cleaning page. Show columns: source, make, model, year, price_gbp, mileage, fuel_type, transmission, body_type, engine_size, region, url.

---

## Timing check

| Section | Target | Cumulative |
|---|---|---|
| Introduce scenario | 1 min | 1 min |
| Architecture | 1 min | 2 min |
| Web scraping | 4 min | 6 min |
| Cleaning | 3 min | 9 min |
| EDA | 3 min | 12 min |
| Listings browser | 1.5 min | 13.5 min |
| Ethics | 1 min | 14.5 min |
| Wrap-up | 0.5 min | 15 min |
| Q&A | 5–10 min | 20–25 min |

## Pre-flight checklist for the morning of

- [ ] `./start.sh` runs from a fresh terminal without error
- [ ] Backend `/health` returns `{"status":"ok"}`
- [ ] `/` shows real numbers (not zeros)
- [ ] `/listings` shows cards with images
- [ ] Filter test: search "Ford" narrows results
- [ ] `/cleaning` shows a report from a previous run
- [ ] `/eda` shows all seven charts populated
- [ ] Charger + adapter for laptop
- [ ] Backup plan: screenshots of every page saved locally in case wifi fails
