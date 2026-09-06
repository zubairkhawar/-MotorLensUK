from scrapers.bs4_autotrader import AutotraderScraper
from scrapers.playwright_cargurus import CarGurusScraper
from scrapers.requests_motors import MotorsScraper


SCRAPERS = {
    "autotrader": AutotraderScraper,
    "cargurus": CarGurusScraper,
    "motors": MotorsScraper,
}
