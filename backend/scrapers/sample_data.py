"""Deterministic sample UK-car data generator.

Used as a fallback when live scraping is blocked (AutoTrader/CarGurus actively
defend against scrapers). Produces realistic UK market listings so the pipeline,
cleaning, and EDA can be demonstrated end-to-end.
"""
from __future__ import annotations
import random
from datetime import datetime


MAKES_MODELS = {
    "Ford": ["Fiesta", "Focus", "Kuga", "Puma", "Mondeo"],
    "Volkswagen": ["Golf", "Polo", "Tiguan", "Passat", "T-Roc"],
    "BMW": ["1 Series", "3 Series", "5 Series", "X1", "X3"],
    "Audi": ["A1", "A3", "A4", "Q3", "Q5"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "GLA", "GLC"],
    "Toyota": ["Yaris", "Corolla", "RAV4", "C-HR", "Aygo"],
    "Nissan": ["Qashqai", "Juke", "Micra", "Leaf", "X-Trail"],
    "Vauxhall": ["Corsa", "Astra", "Mokka", "Grandland", "Insignia"],
    "Hyundai": ["i10", "i20", "i30", "Tucson", "Kona"],
    "Kia": ["Picanto", "Rio", "Ceed", "Sportage", "Niro"],
    "Peugeot": ["208", "308", "2008", "3008", "5008"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
    "Honda": ["Jazz", "Civic", "CR-V", "HR-V"],
    "Mazda": ["Mazda2", "Mazda3", "CX-5", "MX-5"],
}

FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "Plug-in Hybrid"]
TRANSMISSIONS = ["Manual", "Automatic"]
BODY_TYPES = ["Hatchback", "Saloon", "Estate", "SUV", "Coupe", "Convertible"]
REGIONS = [
    "London", "South East", "South West", "East of England",
    "West Midlands", "East Midlands", "Yorkshire", "North West",
    "North East", "Wales", "Scotland", "Northern Ireland",
]

BASE_PRICES = {
    "Ford": 14000, "Volkswagen": 17000, "BMW": 24000, "Audi": 25000,
    "Mercedes-Benz": 27000, "Toyota": 16000, "Nissan": 15000,
    "Vauxhall": 12000, "Hyundai": 14000, "Kia": 14500,
    "Peugeot": 13500, "Tesla": 42000, "Honda": 16500, "Mazda": 17500,
}


def _price_for(make: str, year: int, mileage: int, fuel: str) -> float:
    base = BASE_PRICES.get(make, 15000)
    age = max(0, datetime.utcnow().year - year)
    depreciation = 0.85 ** age
    mileage_penalty = max(0.5, 1.0 - (mileage / 200000) * 0.5)
    fuel_multiplier = {
        "Electric": 1.25, "Plug-in Hybrid": 1.15, "Hybrid": 1.10,
        "Petrol": 1.00, "Diesel": 0.92,
    }.get(fuel, 1.0)
    noise = random.uniform(0.85, 1.15)
    return round(base * depreciation * mileage_penalty * fuel_multiplier * noise, 2)


def generate(source: str, n: int, seed: int | None = None) -> list[dict]:
    rng = random.Random(seed if seed is not None else source)
    rows: list[dict] = []
    for i in range(n):
        make = rng.choice(list(MAKES_MODELS.keys()))
        model = rng.choice(MAKES_MODELS[make])
        year = rng.randint(2010, 2024)
        mileage = int(rng.gauss(50000, 30000))
        mileage = max(500, min(mileage, 200000))
        fuel = rng.choices(
            FUEL_TYPES,
            weights=[45, 25, 15, 10, 5],
        )[0]
        transmission = rng.choices(TRANSMISSIONS, weights=[55, 45])[0]
        body = rng.choice(BODY_TYPES)
        region = rng.choice(REGIONS)
        engine = round(rng.choice([1.0, 1.2, 1.4, 1.6, 2.0, 2.5, 3.0]), 1)
        price = _price_for(make, year, mileage, fuel)

        if rng.random() < 0.03:
            price = None
        if rng.random() < 0.02:
            mileage = None
        if rng.random() < 0.01:
            year = None

        rows.append({
            "external_id": f"{source}-{i:05d}",
            "title": f"{year or ''} {make} {model}".strip(),
            "make": make,
            "model": model,
            "year": year,
            "price_gbp": price,
            "mileage": mileage,
            "fuel_type": fuel,
            "transmission": transmission,
            "body_type": body,
            "engine_size": engine,
            "location": region,
            "region": region,
            "url": f"https://example.com/{source}/listing/{i}",
        })
    return rows
