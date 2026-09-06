"""One-click seed endpoint: populates listings + reviews for demo purposes.

Runs all scrapers (which use their sample-data fallbacks) synchronously and
returns a summary. Useful as a "Load demo data" button on the dashboard.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import delete

from app.core.db import get_db
from app.models.listing import Listing
from app.models.review import Review
from app.models.scrape_job import ScrapeJob
from app.core.config import settings

from scrapers.registry import SCRAPERS
from scrapers.reviews_scraper import ReviewsScraper
from cleaning.pipeline import run_cleaning_pipeline


router = APIRouter(prefix="/seed", tags=["seed"])


@router.post("/")
def seed(db: Session = Depends(get_db), reset: bool = True, clean: bool = True):
    if reset:
        db.execute(delete(Listing))
        db.execute(delete(Review))
        db.execute(delete(ScrapeJob))
        db.commit()

    summary = {"listings": {}, "reviews": 0, "cleaned": None}

    for key, scraper_cls in SCRAPERS.items():
        scraper = scraper_cls(max_pages=settings.max_pages_per_source, delay=0.0)
        rows = scraper.run()
        for row in rows:
            db.add(Listing(source=key, is_cleaned=False, **{
                k: row.get(k) for k in [
                    "external_id", "title", "make", "model", "year", "price_gbp",
                    "mileage", "fuel_type", "transmission", "body_type",
                    "engine_size", "location", "region", "url",
                ]
            }))
        summary["listings"][key] = len(rows)
    db.commit()

    review_scraper = ReviewsScraper(max_pages=settings.max_pages_per_source, delay=0.0)
    for r in review_scraper.run():
        db.add(Review(**r))
    summary["reviews"] = len(review_scraper.run())
    db.commit()

    if clean:
        summary["cleaned"] = run_cleaning_pipeline(db)

    return summary
