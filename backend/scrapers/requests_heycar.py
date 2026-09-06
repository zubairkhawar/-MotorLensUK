"""Heycar UK scraper — real listings via requests + BeautifulSoup.

Uses ScrapingBee (JS render) because Heycar's listings are hydrated
client-side. Parses real cards from returned HTML.
No fallback: returns [] on failure.
"""
from __future__ import annotations
import re
from bs4 import BeautifulSoup

from scrapers.base import BaseScraper
from scrapers.scrapingbee_client import bee_get, ScrapingBeeError
from scrapers.wikipedia_images import image_for
from scrapers.bs4_autotrader import UK_MAKES


class HeycarScraper(BaseScraper):
    NAME = "Heycar UK"
    TOOL = "requests + ScrapingBee"
    SITE_URL = "https://heycar.co.uk"

    def _fetch(self, page: int) -> str | None:
        url = f"{self.SITE_URL}/used-cars?page={page}"
        try:
            return bee_get(url, render_js=True, premium=True, wait_ms=5000)
        except ScrapingBeeError:
            return None

    def _parse_title(self, title: str) -> tuple[str | None, str | None]:
        title = re.sub(r"^\d+\s+", "", title)
        for make in sorted(UK_MAKES, key=len, reverse=True):
            if title.startswith(make + " "):
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

    def _parse_article(self, art) -> dict | None:
        text = art.get_text(" ", strip=True).replace("Â£", "£")
        if "£" not in text or "mile" not in text.lower():
            return None

        title = None
        for k in ("h2", "h3", "h4"):
            el = art.select_one(k)
            if el and len(el.get_text(strip=True)) > 5:
                title = el.get_text(" ", strip=True)
                break
        if not title:
            m = re.search(r"(?:20|19)\d{2}\s+([A-Z][A-Za-z\-]+(?:\s+[A-Z0-9\.\-]+)+?)(?=\s+\d)", text)
            title = m.group(1) if m else None
        if not title:
            return None

        make, model = self._parse_title(title)
        if not make:
            return None

        prices = [float(p.replace(",", "")) for p in re.findall(r"£([\d,]{4,7})", text)]
        price = min(prices) if prices else None

        m = re.search(r"([\d,]+)\s*miles", text)
        mileage = int(m.group(1).replace(",", "")) if m else None
        m = re.search(r"\b(20[0-2]\d|19\d{2})\b", text)
        year = int(m.group(1)) if m else None

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

        link = art.select_one("a[href]")
        href = link.get("href") if link else None
        if href and href.startswith("/"):
            href = self.SITE_URL + href
        external_id = None
        if href:
            m = re.search(r"/([a-z0-9\-]{15,})", href)
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
            "location": "UK (Heycar)",
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
            for a in soup.select("article, div[data-testid]"):
                p = self._parse_article(a)
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
