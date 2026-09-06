from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.core.db import SessionLocal, get_db
from app.core.config import settings
from app.models.scrape_job import ScrapeJob
from app.models.listing import Listing
from app.api.schemas import ScrapeJobOut, ScrapeRequest

from scrapers.registry import SCRAPERS


router = APIRouter(prefix="/scrape", tags=["scrape"])


def _run_scraper(job_id: int, source: str, max_pages: int):
    db = SessionLocal()
    try:
        job = db.get(ScrapeJob, job_id)
        if not job:
            return
        job.status = "running"
        db.commit()

        scraper_cls = SCRAPERS.get(source)
        if scraper_cls is None:
            job.status = "failed"
            job.error = f"Unknown source: {source}"
            job.finished_at = datetime.utcnow()
            db.commit()
            return

        scraper = scraper_cls(max_pages=max_pages, delay=settings.scrape_delay_seconds)
        rows = scraper.run()

        for row in rows:
            listing = Listing(
                source=source,
                external_id=row.get("external_id"),
                title=row.get("title"),
                make=row.get("make"),
                model=row.get("model"),
                year=row.get("year"),
                price_gbp=row.get("price_gbp"),
                mileage=row.get("mileage"),
                fuel_type=row.get("fuel_type"),
                transmission=row.get("transmission"),
                body_type=row.get("body_type"),
                engine_size=row.get("engine_size"),
                location=row.get("location"),
                region=row.get("region"),
                url=row.get("url"),
                image_url=row.get("image_url"),
                is_cleaned=False,
            )
            db.add(listing)

        job.rows_scraped = len(rows)
        job.status = "completed"
        job.finished_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        db.rollback()
        job = db.get(ScrapeJob, job_id)
        if job:
            job.status = "failed"
            job.error = str(e)[:2000]
            job.finished_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


@router.get("/sources")
def list_sources():
    return [
        {"key": key, "name": cls.NAME, "tool": cls.TOOL, "url": cls.SITE_URL}
        for key, cls in SCRAPERS.items()
    ]


@router.post("/run", response_model=ScrapeJobOut)
def start_scrape(
    req: ScrapeRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if req.source not in SCRAPERS:
        raise HTTPException(status_code=404, detail=f"Unknown source: {req.source}")
    scraper_cls = SCRAPERS[req.source]
    job = ScrapeJob(source=req.source, tool=scraper_cls.TOOL, status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    max_pages = req.max_pages or settings.max_pages_per_source
    background.add_task(_run_scraper, job.id, req.source, max_pages)
    return job


@router.get("/jobs", response_model=list[ScrapeJobOut])
def list_jobs(db: Session = Depends(get_db), limit: int = 50):
    stmt = select(ScrapeJob).order_by(desc(ScrapeJob.started_at)).limit(limit)
    return db.execute(stmt).scalars().all()


@router.get("/jobs/{job_id}", response_model=ScrapeJobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(ScrapeJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
