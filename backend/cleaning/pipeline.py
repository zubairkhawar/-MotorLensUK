
from __future__ import annotations
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import CLEANED_DIR
from app.models.listing import Listing


LAST_REPORT: dict | None = None


FUEL_CANONICAL = {
    "petrol": "Petrol", "diesel": "Diesel", "hybrid": "Hybrid",
    "electric": "Electric", "ev": "Electric",
    "plug-in hybrid": "Plug-in Hybrid", "phev": "Plug-in Hybrid",
}

MAKE_CANONICAL = {
    "vw": "Volkswagen", "volkswagen": "Volkswagen",
    "merc": "Mercedes-Benz", "mercedes": "Mercedes-Benz",
    "mercedes-benz": "Mercedes-Benz", "bmw": "BMW",
}


def _load_df(db: Session) -> pd.DataFrame:
    rows = db.execute(select(Listing)).scalars().all()
    return pd.DataFrame([{
        "id": r.id, "source": r.source, "external_id": r.external_id,
        "title": r.title, "make": r.make, "model": r.model, "year": r.year,
        "price_gbp": r.price_gbp, "mileage": r.mileage, "fuel_type": r.fuel_type,
        "transmission": r.transmission, "body_type": r.body_type,
        "engine_size": r.engine_size, "location": r.location, "region": r.region,
        "url": r.url, "is_cleaned": r.is_cleaned,
    } for r in rows])


def _cap_outliers(series: pd.Series) -> tuple[pd.Series, int]:
    if series.dropna().empty:
        return series, 0
    q1 = series.quantile(0.05)
    q3 = series.quantile(0.95)
    capped = series.clip(lower=q1, upper=q3)
    changed = int((series != capped).sum())
    return capped, changed


def run_cleaning_pipeline(db: Session) -> dict:
    global LAST_REPORT

    df = _load_df(db)
    rows_before = len(df)
    if rows_before == 0:
        report = {
            "rows_before": 0, "rows_after": 0, "duplicates_removed": 0,
            "nulls_before": {}, "nulls_after": {}, "outliers_capped": {},
            "numeric_summary": {},
        }
        LAST_REPORT = report
        return report

    nulls_before = df.isna().sum().astype(int).to_dict()

    dup_mask = df.duplicated(subset=["source", "external_id"], keep="first")
    dup_mask |= df.duplicated(
        subset=["make", "model", "year", "mileage", "price_gbp"], keep="first"
    )
    duplicates_removed = int(dup_mask.sum())
    df = df[~dup_mask].copy()

    for col, target in [("year", "Int64"), ("mileage", "Int64"), ("price_gbp", "float")]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        if target == "Int64":
            df[col] = df[col].astype("Int64")

    df["make"] = df["make"].astype("string").str.strip()
    df["make"] = df["make"].apply(
        lambda x: MAKE_CANONICAL.get(str(x).lower(), x) if pd.notna(x) else x
    )
    df["model"] = df["model"].astype("string").str.strip()

    df["fuel_type"] = df["fuel_type"].astype("string").str.strip().str.lower().map(
        lambda x: FUEL_CANONICAL.get(x, x.title() if isinstance(x, str) else x)
    )

    df["region"] = df["region"].fillna(df["location"])

    price_capped, price_changed = _cap_outliers(df["price_gbp"])
    mileage_capped, mileage_changed = _cap_outliers(df["mileage"].astype("float"))
    df["price_gbp"] = price_capped
    df["mileage"] = mileage_capped.round().astype("Int64")

    df = df.dropna(subset=["price_gbp", "make", "model"])

    nulls_after = df.isna().sum().astype(int).to_dict()

    numeric_summary = {
        col: {
            "count": int(df[col].count()),
            "mean": float(df[col].mean()) if df[col].count() else None,
            "std": float(df[col].std()) if df[col].count() else None,
            "min": float(df[col].min()) if df[col].count() else None,
            "median": float(df[col].median()) if df[col].count() else None,
            "max": float(df[col].max()) if df[col].count() else None,
        }
        for col in ["price_gbp", "mileage", "year", "engine_size"]
    }

    id_set = set(df["id"].tolist())
    for listing in db.execute(select(Listing)).scalars().all():
        if listing.id in id_set:
            row = df.loc[df["id"] == listing.id].iloc[0]
            listing.make = row["make"] if pd.notna(row["make"]) else None
            listing.model = row["model"] if pd.notna(row["model"]) else None
            listing.fuel_type = row["fuel_type"] if pd.notna(row["fuel_type"]) else None
            listing.year = int(row["year"]) if pd.notna(row["year"]) else None
            listing.price_gbp = float(row["price_gbp"]) if pd.notna(row["price_gbp"]) else None
            listing.mileage = int(row["mileage"]) if pd.notna(row["mileage"]) else None
            listing.region = row["region"] if pd.notna(row["region"]) else None
            listing.is_cleaned = True
        else:
            db.delete(listing)
    db.commit()

    report = {
        "rows_before": rows_before,
        "rows_after": len(df),
        "duplicates_removed": duplicates_removed,
        "nulls_before": nulls_before,
        "nulls_after": nulls_after,
        "outliers_capped": {
            "price_gbp": price_changed,
            "mileage": mileage_changed,
        },
        "numeric_summary": numeric_summary,
    }
    LAST_REPORT = report
    return report


def export_cleaned_csv(db: Session) -> str:
    rows = db.execute(select(Listing).where(Listing.is_cleaned.is_(True))).scalars().all()
    df = pd.DataFrame([{
        "source": r.source, "make": r.make, "model": r.model, "year": r.year,
        "price_gbp": r.price_gbp, "mileage": r.mileage, "fuel_type": r.fuel_type,
        "transmission": r.transmission, "body_type": r.body_type,
        "engine_size": r.engine_size, "region": r.region, "url": r.url,
    } for r in rows])
    path = CLEANED_DIR / "uk_cars_cleaned.csv"
    df.to_csv(path, index=False)
    return str(path)
