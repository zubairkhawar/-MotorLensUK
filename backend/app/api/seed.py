"""One-click seed endpoint: runs all real scrapers to populate the database.

No fallback, no synthetic. All scrapers hit real UK car sites via ScrapingBee
(where needed) or Playwright. Runs cleaning at the end.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import delete

from app.core.db import get_db
from app.models.listing import Listing
from app.models.scrape_job import ScrapeJob
from app.core.config import settings

from scrapers.registry import SCRAPERS
from cleaning.pipeline import run_cleaning_pipeline


router = APIRouter(prefix="/seed", tags=["seed"])


@router.post("/")
def seed(db: Session = Depends(get_db), reset: bool = True, clean: bool = True):
    if reset:
        db.execute(delete(Listing))
        db.execute(delete(ScrapeJob))
        db.commit()

    summary: dict = {"listings": {}, "cleaned": None}
    fields = [
        "external_id", "title", "make", "model", "year", "price_gbp",
        "mileage", "fuel_type", "transmission", "body_type",
        "engine_size", "location", "region", "url", "image_url",
    ]

    for key, scraper_cls in SCRAPERS.items():
        try:
            scraper = scraper_cls(max_pages=settings.max_pages_per_source, delay=0.0)
            rows = scraper.run()
            for row in rows:
                db.add(Listing(source=key, is_cleaned=False, **{k: row.get(k) for k in fields}))
            summary["listings"][key] = len(rows)
        except Exception as e:
            summary["listings"][key] = f"error: {str(e)[:200]}"
    db.commit()

    if clean:
        summary["cleaned"] = run_cleaning_pipeline(db)

    return summary
