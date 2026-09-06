from scrapers.bs4_autotrader import AutotraderScraper
from scrapers.playwright_cinch import CinchScraper
from scrapers.requests_heycar import HeycarScraper


SCRAPERS = {
    "autotrader": AutotraderScraper,
    "cinch": CinchScraper,
    "heycar": HeycarScraper,
}
