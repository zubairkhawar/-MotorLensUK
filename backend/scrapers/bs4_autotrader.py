
from __future__ import annotations
import re
from bs4 import BeautifulSoup

from scrapers.base import BaseScraper
from scrapers.scrapingbee_client import bee_get, ScrapingBeeError
from scrapers.wikipedia_images import image_for


UK_MAKES = {
    "Vauxhall", "Ford", "Volkswagen", "BMW", "Audi", "Mercedes-Benz",
    "Toyota", "Nissan", "Hyundai", "Kia", "Peugeot", "Renault",
    "Citroen", "Honda", "Mazda", "Skoda", "Seat", "Fiat", "MG",
    "Mini", "Volvo", "Land Rover", "Jaguar", "Tesla", "Porsche",
    "Suzuki", "Mitsubishi", "Lexus", "Jeep", "Alfa Romeo", "Dacia",
    "Cupra", "SsangYong", "Smart", "Chrysler", "Subaru", "Bentley",
}


class AutotraderScraper(BaseScraper):
    NAME = "AutoTrader UK"
    TOOL = "BeautifulSoup + ScrapingBee"
    SITE_URL = "https://www.autotrader.co.uk"

    SEARCH_URL = "https://www.autotrader.co.uk/car-search?postcode=SW1A1AA&sort=relevance&page={page}"

    def _fetch_page(self, page: int) -> str | None:
        try:
            return bee_get(
                self.SEARCH_URL.format(page=page),
                render_js=True, premium=True, wait_ms=5000,
            )
        except ScrapingBeeError:
            return None

    def _parse_title(self, title: str) -> tuple[str | None, str | None]:
        for make in sorted(UK_MAKES, key=len, reverse=True):
            if title.startswith(make + " "):
                rest = title[len(make) + 1:].strip()
                parts = rest.split()
                if not parts:
                    return make, None
                model_parts = []
                for p in parts:
                    if re.match(r"^\d+\.\d+[a-zA-Z]*$", p):
                        break
                    if p.isdigit() and len(p) == 4:
                        break
                    model_parts.append(p)
                    if len(model_parts) >= 3:
                        break
                model = " ".join(model_parts) if model_parts else None
                return make, model
        return None, None

    def _parse_listing(self, li) -> dict | None:
        text = li.get_text(" ", strip=True).replace("Â£", "£").replace("Ã©", "é")
        if "£" not in text or "mile" not in text.lower():
            return None

        title = None
        title_el = li.select_one("h3, h2")
        if title_el:
            title = title_el.get_text(" ", strip=True)
        if not title:
            m = re.search(r"\d+/\d+\s+([A-Z][^,£]+?)(?=\s*,\s*£|\s*£)", text)
            if m:
                title = m.group(1).strip()
        if not title:
            return None
        make, model = self._parse_title(title)
        if not make:
            return None

        price = None
        m = re.search(r"£([\d,]+)", text)
        if m:
            try:
                price = float(m.group(1).replace(",", ""))
            except ValueError:
                pass

        mileage = None
        m = re.search(r"([\d,]+)\s*miles", text)
        if m:
            try:
                mileage = int(m.group(1).replace(",", ""))
            except ValueError:
                pass

        year = None
        m = re.search(r"\b(20[0-2]\d|19\d{2})\b", text)
        if m:
            year = int(m.group(0))

        fuel_type = None
        for f in ["Plug-in Hybrid", "Hybrid", "Electric", "Petrol", "Diesel"]:
            if f.lower() in text.lower():
                fuel_type = f
                break

        transmission = None
        for t in ["Manual", "Automatic"]:
            if t.lower() in text.lower():
                transmission = t
                break

        body_type = None
        for b in ["Hatchback", "Saloon", "Estate", "SUV", "Coupe", "Convertible", "MPV"]:
            if b.lower() in text.lower():
                body_type = b
                break

        location = None
        m = re.search(r"Dealer location\s*([A-Za-z\-\s]+?)\s*\(", text)
        if m:
            location = m.group(1).strip()

        link = li.select_one('a[href*="/car-details/"]')
        href = link.get("href") if link else None
        external_id = None
        if href:
            m = re.search(r"/car-details/(\d+)", href)
            if m:
                external_id = m.group(1)
            if href.startswith("/"):
                href = self.SITE_URL + href

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
            "body_type": body_type,
            "engine_size": None,
            "location": location,
            "region": location,
            "url": href,
            "image_url": image_for(make, model),
        }

    def run(self) -> list[dict]:
        rows: list[dict] = []
        for page in range(1, self.max_pages + 1):
            html = self._fetch_page(page)
            if not html:
                continue
            soup = BeautifulSoup(html, "lxml")
            for li in soup.select("li"):
                parsed = self._parse_listing(li)
                if parsed:
                    rows.append(parsed)
        seen = set()
        deduped = []
        for r in rows:
            key = r.get("external_id") or (r.get("title"), r.get("price_gbp"))
            if key in seen:
                continue
            seen.add(key)
            deduped.append(r)
        return deduped
