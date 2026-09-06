# MotorLens UK

**DAT7403 — Portfolio 2** · Web scraping · Data cleaning · EDA

A full-stack webapp that scrapes UK automotive listings from multiple sources
using **three different scraping tools**, cleans the data, and exposes an
interactive analytics dashboard for a fictional consumer market-intelligence
company in the British automotive industry.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) · Tailwind · Recharts |
| Backend | FastAPI · SQLAlchemy · SQLite |
| Scrapers | BeautifulSoup · Playwright · requests+regex |
| Analytics | pandas · numpy · VADER (sentiment) |

## Quick start

```bash
# --- Backend ---
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium         # optional, for Playwright scraper
uvicorn app.main:app --reload --port 8000

# --- Frontend (new terminal) ---
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

## Demo flow (matches assignment presentation)

1. **Scrape** — open `/scrape`, click **Run** on each of the 3 sources
2. **Clean** — open `/cleaning`, click **Run cleaning** to see before/after stats
3. **EDA** — open `/eda` for 6 interactive charts
4. **Export** — download the cleaned CSV (assignment deliverable)
5. **Ethics** — `/ethics` shows scraping policy and robots.txt status

## Assignment mapping

| Deliverable | Where |
|---|---|
| ≥ 2 scraping tools | `backend/scrapers/` (BS4, Playwright, requests) |
| Data cleaning script | `backend/cleaning/pipeline.py` |
| EDA scripts | `backend/eda/analytics.py` |
| Cleaned CSV output | `data/cleaned/uk_cars_cleaned.csv` |
| Ethics awareness | `/ethics` page + `docs/ethical_scraping.md` |

## Notes on live scraping

AutoTrader/CarGurus actively block automated access. Each scraper first
attempts a live fetch and — if blocked — falls back to a deterministic
sample dataset generator (see `scrapers/sample_data.py`) so the end-to-end
pipeline is always demonstrable.

In production, respectful academic scraping would use official APIs
(where available) and negotiated access.
