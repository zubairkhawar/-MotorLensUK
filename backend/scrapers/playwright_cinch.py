"""Cinch UK scraper — real listings via Playwright (headless Chromium).

Cinch renders listings client-side, so a headless browser is required.
No fallback: returns [] if Playwright is unavailable or the fetch fails.
"""
from __future__ import annotations
import re
from bs4 import BeautifulSoup

from scrapers.base import BaseScraper
from scrapers.wikipedia_images import image_for
from scrapers.bs4_autotrader import UK_MAKES


class CinchScraper(BaseScraper):
    NAME = "Cinch"
    TOOL = "Playwright"
    SITE_URL = "https://www.cinch.co.uk"

    def _fetch(self, page: int) -> str | None:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return None
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                               "AppleWebKit/537.36 (KHTML, like Gecko) "
                               "Chrome/120.0.0.0 Safari/537.36"
                )
                pg = context.new_page()
                url = f"{self.SITE_URL}/used-cars?page={page}"
                pg.goto(url, timeout=20000, wait_until="domcontentloaded")
                try:
                    pg.wait_for_selector("li:has-text('miles')", timeout=8000)
                except Exception:
                    pass
                html = pg.content()
                browser.close()
                return html
        except Exception:
            return None

    def _parse_title(self, title: str) -> tuple[str | None, str | None]:
        for make in sorted(UK_MAKES, key=len, reverse=True):
            if title.lower().startswith(make.lower() + " "):
                rest = title[len(make) + 1:].strip()
                parts = rest.split()
                model_parts = []
                for p in parts:
                    if re.match(r"^\d+\.\d+", p):
                        break
                    model_parts.append(p)
                    if len(model_parts) >= 2:
                        break
                return make, " ".join(model_parts) if model_parts else None
        return None, None

    def _parse_listing(self, node) -> dict | None:
        text = node.get_text(" ", strip=True).replace("Â£", "£")
        if "£" not in text or "mile" not in text.lower():
            return None

        title = None
        for k in ("h2", "h3", "h4", "a"):
            el = node.select_one(k)
            if el and len(el.get_text(strip=True)) > 5:
                title = el.get_text(" ", strip=True)
                break
        if not title:
            return None

        title = re.sub(r"^£\s*\d+\s*(off\s+)?", "", title, flags=re.I).strip()
        make, model = self._parse_title(title)
        if not make:
            return None

        price = None
        prices = [float(p.replace(",", "")) for p in re.findall(r"£([\d,]{3,7})", text)]
        if prices:
            price = min(prices)

        m = re.search(r"([\d,]+)\s*miles", text)
        mileage = int(m.group(1).replace(",", "")) if m else None
        m = re.search(r"Vehicle year\s*[,.]?\s*(20\d{2}|19\d{2})", text)
        year = int(m.group(1)) if m else None
        if not year:
            m = re.search(r"\b(20[0-2]\d)\b", text)
            year = int(m.group(0)) if m else None

        fuel_type = None
        for f in ["Plug-in Hybrid", "Hybrid", "Electric", "Petrol", "Diesel"]:
            if re.search(r"\b" + re.escape(f) + r"\b", text, re.I):
                fuel_type = f
                break

        transmission = None
        for t in ["Automatic", "Manual"]:
            if re.search(r"\b" + t + r"\b", text, re.I):
                transmission = t
                break

        link = node.select_one("a[href]")
        href = link.get("href") if link else None
        if href and href.startswith("/"):
            href = self.SITE_URL + href
        external_id = None
        if href:
            m = re.search(r"/([a-f0-9\-]{20,})", href)
            if m:
                external_id = m.group(1)

        return {
            "external_id": external_id,
            "title": title,
            "make": make,
            "model": model,
            "year": year,
            "price_gbp": price,
            "mileage": mileage,
            "fuel_type": fuel_type,
            "transmission": transmission,
            "body_type": None,
            "engine_size": None,
            "location": "UK (Cinch)",
            "region": "UK",
            "url": href,
            "image_url": image_for(make, model),
        }

    def run(self) -> list[dict]:
        rows: list[dict] = []
        for page in range(1, self.max_pages + 1):
            html = self._fetch(page)
            if not html:
                continue
            soup = BeautifulSoup(html, "lxml")
            for li in soup.select("li"):
                p = self._parse_listing(li)
                if p:
                    rows.append(p)
        seen = set()
        out = []
        for r in rows:
            key = r.get("external_id") or (r.get("title"), r.get("price_gbp"))
            if key in seen:
                continue
            seen.add(key)
            out.append(r)
        return out
