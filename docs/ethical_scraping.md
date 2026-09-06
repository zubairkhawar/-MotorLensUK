# Ethical Scraping Statement

This project is an academic exercise for **DAT7403 — Data Mining and Machine
Learning** (M.Sc. Data Analytics & Technologies). All scraping is conducted
for research and educational purposes only; no data is redistributed.

## Principles observed

1. **robots.txt** — checked on every target host before scraping (see the
   `/ethics` page for live status).
2. **Rate limiting** — a mandatory delay (`SCRAPE_DELAY_SECONDS`, default 2s)
   between requests, plus a hard cap on pages per source.
3. **Identifying User-Agent** — a descriptive UA string that identifies the
   project and provides a contact address.
4. **Public data only** — only publicly-accessible listing pages are scraped.
   The system never bypasses logins, paywalls, or CAPTCHA.
5. **No re-hosting** — scraped data is stored locally for analysis and never
   published or re-distributed.
6. **Caching** — repeated requests are avoided; scrape results are stored in
   a local database and re-used.
7. **Fallback to synthetic data** — where live scraping is blocked by
   anti-bot measures, deterministic synthetic UK market data is generated
   for pipeline demonstration.

## Sites in scope

| Site | robots.txt | Approach |
|---|---|---|
| AutoTrader UK | Respected | BeautifulSoup, static HTML |
| CarGurus UK | Respected | Playwright, JS-rendered |
| Motors.co.uk | Respected | requests + regex |

## References

- Krotov, V. & Silva, L. (2018). *Legality and Ethics of Web Scraping*.
- Mitchell, R. (2018). *Web Scraping with Python* (2nd ed.), O'Reilly.
- Robots Exclusion Protocol — IETF RFC 9309 (2022).
