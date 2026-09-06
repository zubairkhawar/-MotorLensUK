from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.db import get_db
from app.models.listing import Listing
from app.api.schemas import ListingOut


router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("/", response_model=list[ListingOut])
def list_listings(
    db: Session = Depends(get_db),
    make: str | None = None,
    fuel_type: str | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    cleaned_only: bool = True,
    limit: int = Query(200, le=2000),
    offset: int = 0,
):
    stmt = select(Listing)
    if cleaned_only:
        stmt = stmt.where(Listing.is_cleaned.is_(True))
    if make:
        stmt = stmt.where(Listing.make == make)
    if fuel_type:
        stmt = stmt.where(Listing.fuel_type == fuel_type)
    if year_min is not None:
        stmt = stmt.where(Listing.year >= year_min)
    if year_max is not None:
        stmt = stmt.where(Listing.year <= year_max)
    if price_min is not None:
        stmt = stmt.where(Listing.price_gbp >= price_min)
    if price_max is not None:
        stmt = stmt.where(Listing.price_gbp <= price_max)
    stmt = stmt.limit(limit).offset(offset)
    return db.execute(stmt).scalars().all()


@router.get("/facets")
def get_facets(db: Session = Depends(get_db)):
    rows = db.execute(select(Listing.make, Listing.fuel_type, Listing.region)).all()
    makes = sorted({r[0] for r in rows if r[0]})
    fuels = sorted({r[1] for r in rows if r[1]})
    regions = sorted({r[2] for r in rows if r[2]})
    return {"makes": makes, "fuel_types": fuels, "regions": regions}
