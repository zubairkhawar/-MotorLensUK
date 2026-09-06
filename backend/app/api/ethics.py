from fastapi import APIRouter
import httpx

from app.core.config import settings
from scrapers.registry import SCRAPERS


router = APIRouter(prefix="/ethics", tags=["ethics"])


@router.get("/policy")
def policy():
    return {
        "user_agent": settings.user_agent,
        "delay_between_requests_seconds": settings.scrape_delay_seconds,
        "max_pages_per_source": settings.max_pages_per_source,
        "principles": [
            "Respect robots.txt on every target site.",
            "Identify the scraper via a descriptive User-Agent.",
            "Apply a minimum delay between requests to avoid load.",
            "Scrape only publicly visible data; never bypass logins or paywalls.",
            "Use data for the stated academic research purpose only.",
            "Cache aggressively to avoid repeated requests.",
        ],
    }


@router.get("/robots")
def robots_status():
    results = []
    for key, cls in SCRAPERS.items():
        entry = {"source": key, "site": cls.SITE_URL, "robots_url": None, "status": "unknown"}
        try:
            base = cls.SITE_URL.rstrip("/")
            robots_url = f"{base}/robots.txt"
            entry["robots_url"] = robots_url
            r = httpx.get(robots_url, timeout=5.0, headers={"User-Agent": settings.user_agent})
            entry["status"] = "reachable" if r.status_code == 200 else f"http_{r.status_code}"
            entry["snippet"] = r.text[:400] if r.status_code == 200 else None
        except Exception as e:
            entry["status"] = f"error: {type(e).__name__}"
        results.append(entry)
    return results
