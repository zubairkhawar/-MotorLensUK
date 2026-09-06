"""Fetch real car images from Wikipedia infoboxes.

Given a make + model, returns the primary infobox image URL from the
corresponding Wikipedia page (real image, Wikimedia Commons hosted).
"""
from __future__ import annotations
import re
import requests
from bs4 import BeautifulSoup
from functools import lru_cache


HEADERS = {"User-Agent": "MotorLens-Research/1.0 (Academic project; DAT7403)"}

WIKI_ALIASES = {
    ("Vauxhall", "Corsa"): "Vauxhall_Corsa",
    ("Ford", "Fiesta"): "Ford_Fiesta",
    ("Ford", "Focus"): "Ford_Focus",
    ("Ford", "Kuga"): "Ford_Kuga",
    ("Ford", "Puma"): "Ford_Puma_(crossover)",
    ("Ford", "Mondeo"): "Ford_Mondeo",
    ("Volkswagen", "Golf"): "Volkswagen_Golf",
    ("Volkswagen", "Polo"): "Volkswagen_Polo",
    ("Volkswagen", "Tiguan"): "Volkswagen_Tiguan",
    ("Volkswagen", "Passat"): "Volkswagen_Passat",
    ("BMW", "1 Series"): "BMW_1_Series",
    ("BMW", "3 Series"): "BMW_3_Series",
    ("BMW", "5 Series"): "BMW_5_Series",
    ("BMW", "X1"): "BMW_X1",
    ("BMW", "X3"): "BMW_X3",
    ("Audi", "A1"): "Audi_A1",
    ("Audi", "A3"): "Audi_A3",
    ("Audi", "A4"): "Audi_A4",
    ("Audi", "Q3"): "Audi_Q3",
    ("Audi", "Q5"): "Audi_Q5",
    ("Mercedes-Benz", "A-Class"): "Mercedes-Benz_A-Class",
    ("Mercedes-Benz", "C-Class"): "Mercedes-Benz_C-Class",
    ("Mercedes-Benz", "E-Class"): "Mercedes-Benz_E-Class",
    ("Toyota", "Yaris"): "Toyota_Yaris",
    ("Toyota", "Corolla"): "Toyota_Corolla",
    ("Toyota", "RAV4"): "Toyota_RAV4",
    ("Nissan", "Qashqai"): "Nissan_Qashqai",
    ("Nissan", "Juke"): "Nissan_Juke",
    ("Nissan", "Leaf"): "Nissan_Leaf",
    ("Vauxhall", "Astra"): "Opel_Astra",
    ("Vauxhall", "Mokka"): "Opel_Mokka",
    ("Hyundai", "i10"): "Hyundai_i10",
    ("Hyundai", "i20"): "Hyundai_i20",
    ("Hyundai", "i30"): "Hyundai_i30",
    ("Hyundai", "Tucson"): "Hyundai_Tucson",
    ("Hyundai", "Kona"): "Hyundai_Kona",
    ("Kia", "Picanto"): "Kia_Picanto",
    ("Kia", "Rio"): "Kia_Rio_(car)",
    ("Kia", "Ceed"): "Kia_Ceed",
    ("Kia", "Sportage"): "Kia_Sportage",
    ("Kia", "Niro"): "Kia_Niro",
    ("Peugeot", "208"): "Peugeot_208",
    ("Peugeot", "308"): "Peugeot_308",
    ("Peugeot", "2008"): "Peugeot_2008",
    ("Peugeot", "3008"): "Peugeot_3008",
    ("Tesla", "Model 3"): "Tesla_Model_3",
    ("Tesla", "Model Y"): "Tesla_Model_Y",
    ("Tesla", "Model S"): "Tesla_Model_S",
    ("Tesla", "Model X"): "Tesla_Model_X",
    ("Honda", "Jazz"): "Honda_Jazz",
    ("Honda", "Civic"): "Honda_Civic",
    ("Honda", "CR-V"): "Honda_CR-V",
    ("Mazda", "Mazda2"): "Mazda_Mazda2",
    ("Mazda", "Mazda3"): "Mazda_Mazda3",
    ("Mazda", "CX-5"): "Mazda_CX-5",
    ("Mazda", "MX-5"): "Mazda_MX-5",
}


def _wiki_page(make: str, model: str) -> str | None:
    key = (make, model)
    if key in WIKI_ALIASES:
        return WIKI_ALIASES[key]
    return f"{make}_{model}".replace(" ", "_")


@lru_cache(maxsize=256)
def image_for(make: str | None, model: str | None) -> str | None:
    if not make or not model:
        return None
    page = _wiki_page(make, model)
    if not page:
        return None
    url = f"https://en.wikipedia.org/wiki/{page}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=8)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "lxml")
        infobox = soup.select_one("table.infobox")
        if not infobox:
            return None
        img = infobox.select_one("img")
        if not img:
            return None
        src = img.get("src", "")
        if src.startswith("//"):
            src = "https:" + src
        src = re.sub(r"/thumb/", "/", src)
        src = re.sub(r"/\d+px-[^/]+$", "", src)
        return src
    except Exception:
        return None
