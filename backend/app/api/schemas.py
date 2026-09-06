from datetime import datetime
from pydantic import BaseModel


class ListingOut(BaseModel):
    id: int
    source: str
    make: str | None
    model: str | None
    year: int | None
    price_gbp: float | None
    mileage: int | None
    fuel_type: str | None
    transmission: str | None
    body_type: str | None
    location: str | None
    region: str | None
    url: str | None
    is_cleaned: bool
    scraped_at: datetime

    class Config:
        from_attributes = True


class ScrapeJobOut(BaseModel):
    id: int
    source: str
    tool: str
    status: str
    rows_scraped: int
    error: str | None
    started_at: datetime
    finished_at: datetime | None

    class Config:
        from_attributes = True


class ScrapeRequest(BaseModel):
    source: str
    max_pages: int | None = None


class CleaningReport(BaseModel):
    rows_before: int
    rows_after: int
    duplicates_removed: int
    nulls_before: dict
    nulls_after: dict
    outliers_capped: dict
    numeric_summary: dict


class SummaryStats(BaseModel):
    total_listings: int
    total_reviews: int
    unique_makes: int
    unique_models: int
    avg_price: float | None
    median_price: float | None
    avg_mileage: float | None
    avg_year: float | None
    sources: dict


class ChartPoint(BaseModel):
    label: str
    value: float


class ScatterPoint(BaseModel):
    x: float
    y: float
    label: str | None = None
