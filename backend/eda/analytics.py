"""EDA analytics functions — pandas + numpy over cleaned Listings.

Each function returns JSON-serialisable dicts consumable by the frontend
(Recharts/Plotly). Statistical rigour: aggregates only, no ML.
"""
from __future__ import annotations
from datetime import datetime
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.listing import Listing
from app.models.review import Review


def _df(db: Session, cleaned_only: bool = True) -> pd.DataFrame:
    stmt = select(Listing)
    if cleaned_only:
        stmt = stmt.where(Listing.is_cleaned.is_(True))
    rows = db.execute(stmt).scalars().all()
    if not rows:
        return pd.DataFrame(columns=[
            "make", "model", "year", "price_gbp", "mileage",
            "fuel_type", "transmission", "body_type", "region", "source",
        ])
    return pd.DataFrame([{
        "make": r.make, "model": r.model, "year": r.year, "price_gbp": r.price_gbp,
        "mileage": r.mileage, "fuel_type": r.fuel_type, "transmission": r.transmission,
        "body_type": r.body_type, "region": r.region, "source": r.source,
    } for r in rows])


def summary_stats(db: Session) -> dict:
    df = _df(db)
    reviews = db.execute(select(Review)).scalars().all()
    source_counts = df["source"].value_counts().to_dict() if len(df) else {}
    return {
        "total_listings": int(len(df)),
        "total_reviews": len(reviews),
        "unique_makes": int(df["make"].nunique()) if len(df) else 0,
        "unique_models": int(df["model"].nunique()) if len(df) else 0,
        "avg_price": float(df["price_gbp"].mean()) if len(df) else None,
        "median_price": float(df["price_gbp"].median()) if len(df) else None,
        "avg_mileage": float(df["mileage"].mean()) if len(df) else None,
        "avg_year": float(df["year"].mean()) if len(df) else None,
        "sources": {k: int(v) for k, v in source_counts.items()},
    }


def price_distribution(db: Session, bins: int = 30) -> dict:
    df = _df(db)
    if df.empty:
        return {"bins": [], "counts": []}
    prices = df["price_gbp"].dropna().to_numpy()
    counts, edges = np.histogram(prices, bins=bins)
    centers = [(edges[i] + edges[i + 1]) / 2 for i in range(len(counts))]
    return {
        "bins": [round(c, 2) for c in centers],
        "counts": counts.tolist(),
    }


def top_makes(db: Session, limit: int = 15) -> list[dict]:
    df = _df(db)
    if df.empty:
        return []
    counts = df["make"].value_counts().head(limit)
    return [{"label": k, "value": int(v)} for k, v in counts.items()]


def top_models(db: Session, limit: int = 20) -> list[dict]:
    df = _df(db)
    if df.empty:
        return []
    df["full"] = df["make"].astype(str) + " " + df["model"].astype(str)
    counts = df["full"].value_counts().head(limit)
    return [{"label": k, "value": int(v)} for k, v in counts.items()]


def fuel_mix(db: Session) -> list[dict]:
    df = _df(db)
    if df.empty:
        return []
    counts = df["fuel_type"].value_counts()
    return [{"label": k, "value": int(v)} for k, v in counts.items()]


def fuel_mix_by_year(db: Session) -> list[dict]:
    df = _df(db).dropna(subset=["year", "fuel_type"])
    if df.empty:
        return []
    pivot = df.groupby(["year", "fuel_type"]).size().unstack(fill_value=0)
    out = []
    for year, row in pivot.iterrows():
        entry = {"year": int(year)}
        for fuel, count in row.items():
            entry[fuel] = int(count)
        out.append(entry)
    return out


def depreciation_scatter(db: Session) -> list[dict]:
    df = _df(db).dropna(subset=["year", "price_gbp"])
    if df.empty:
        return []
    now = datetime.utcnow().year
    df["age"] = now - df["year"]
    sample = df.sample(n=min(500, len(df)), random_state=1)
    return [
        {"x": int(row["age"]), "y": float(row["price_gbp"]), "label": row["make"]}
        for _, row in sample.iterrows()
    ]


def price_vs_mileage(db: Session) -> list[dict]:
    df = _df(db).dropna(subset=["mileage", "price_gbp"])
    if df.empty:
        return []
    sample = df.sample(n=min(500, len(df)), random_state=2)
    return [
        {"x": int(row["mileage"]), "y": float(row["price_gbp"]), "label": row["fuel_type"]}
        for _, row in sample.iterrows()
    ]


def regional_prices(db: Session) -> list[dict]:
    df = _df(db).dropna(subset=["region", "price_gbp"])
    if df.empty:
        return []
    grouped = df.groupby("region")["price_gbp"].agg(["mean", "median", "count"]).reset_index()
    return [
        {
            "region": row["region"],
            "mean": round(float(row["mean"]), 2),
            "median": round(float(row["median"]), 2),
            "count": int(row["count"]),
        }
        for _, row in grouped.iterrows()
    ]


def price_by_make_box(db: Session, limit: int = 12) -> list[dict]:
    df = _df(db).dropna(subset=["make", "price_gbp"])
    if df.empty:
        return []
    top = df["make"].value_counts().head(limit).index.tolist()
    df = df[df["make"].isin(top)]
    out = []
    for make in top:
        prices = df.loc[df["make"] == make, "price_gbp"].dropna().to_numpy()
        if len(prices) == 0:
            continue
        out.append({
            "make": make,
            "min": float(np.min(prices)),
            "q1": float(np.percentile(prices, 25)),
            "median": float(np.median(prices)),
            "q3": float(np.percentile(prices, 75)),
            "max": float(np.max(prices)),
            "count": int(len(prices)),
        })
    return out


def sentiment_summary(db: Session) -> dict:
    reviews = db.execute(select(Review)).scalars().all()
    if not reviews:
        return {"count": 0, "avg_sentiment": None, "distribution": {}}
    sentiments = [r.sentiment for r in reviews if r.sentiment is not None]
    if not sentiments:
        return {"count": len(reviews), "avg_sentiment": None, "distribution": {}}
    arr = np.array(sentiments)
    return {
        "count": len(sentiments),
        "avg_sentiment": float(arr.mean()),
        "distribution": {
            "positive": int((arr > 0.05).sum()),
            "neutral": int(((arr >= -0.05) & (arr <= 0.05)).sum()),
            "negative": int((arr < -0.05).sum()),
        },
    }
