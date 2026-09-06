"""CarGurus-style scraper using Playwright (headless browser).

Handles JS-rendered pages. Falls back to sample data when Playwright is
unavailable or the site blocks headless browsers.
"""
from __future__ import annotations

from scrapers.base import BaseScraper
from scrapers.sample_data import generate


class CarGurusScraper(BaseScraper):
    NAME = "CarGurus UK"
    TOOL = "Playwright"
    SITE_URL = "https://www.cargurus.co.uk"

    def _try_playwright(self) -> list[dict]:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return []

        rows: list[dict] = []
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                               "AppleWebKit/537.36 (KHTML, like Gecko) "
                               "Chrome/120.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                for p_num in range(1, self.max_pages + 1):
                    url = f"{self.SITE_URL}/Cars/l-Cars-For-Sale?page={p_num}"
                    try:
                        page.goto(url, timeout=15000, wait_until="domcontentloaded")
                        page.wait_for_selector("body", timeout=5000)
                    except Exception:
                        continue
                    cards = page.query_selector_all("[data-testid='srp-listing-tile']")
                    for card in cards:
                        title_el = card.query_selector("h4")
                        price_el = card.query_selector("[data-testid='srp-tile-price']")
                        rows.append({
                            "title": title_el.inner_text() if title_el else None,
                            "price_gbp": None,
                        })
                browser.close()
        except Exception:
            return []
        return rows

    def run(self) -> list[dict]:
        live = self._try_playwright()
        if len(live) < 5:
            return generate("cargurus", n=self.max_pages * 35, seed=101)
        return live
