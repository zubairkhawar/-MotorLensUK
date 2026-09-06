from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.schemas import SummaryStats
from eda import analytics


router = APIRouter(prefix="/eda", tags=["eda"])


@router.get("/summary", response_model=SummaryStats)
def summary(db: Session = Depends(get_db)):
    return analytics.summary_stats(db)


@router.get("/price-distribution")
def price_distribution(db: Session = Depends(get_db), bins: int = 30):
    return analytics.price_distribution(db, bins=bins)


@router.get("/top-makes")
def top_makes(db: Session = Depends(get_db), limit: int = 15):
    return analytics.top_makes(db, limit=limit)


@router.get("/top-models")
def top_models(db: Session = Depends(get_db), limit: int = 20):
    return analytics.top_models(db, limit=limit)


@router.get("/fuel-mix")
def fuel_mix(db: Session = Depends(get_db)):
    return analytics.fuel_mix(db)


@router.get("/fuel-mix-by-year")
def fuel_mix_by_year(db: Session = Depends(get_db)):
    return analytics.fuel_mix_by_year(db)


@router.get("/depreciation")
def depreciation(db: Session = Depends(get_db)):
    return analytics.depreciation_scatter(db)


@router.get("/price-vs-mileage")
def price_vs_mileage(db: Session = Depends(get_db)):
    return analytics.price_vs_mileage(db)


@router.get("/regional-prices")
def regional_prices(db: Session = Depends(get_db)):
    return analytics.regional_prices(db)


@router.get("/price-by-make")
def price_by_make(db: Session = Depends(get_db), limit: int = 12):
    return analytics.price_by_make_box(db, limit=limit)


@router.get("/sentiment")
def sentiment(db: Session = Depends(get_db)):
    return analytics.sentiment_summary(db)
