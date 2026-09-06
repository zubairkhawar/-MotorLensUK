from __future__ import annotations
import time
from abc import ABC, abstractmethod


class BaseScraper(ABC):
    NAME: str = "base"
    TOOL: str = "unknown"
    SITE_URL: str = ""

    def __init__(self, max_pages: int = 3, delay: float = 2.0):
        self.max_pages = max_pages
        self.delay = delay

    def polite_sleep(self):
        time.sleep(self.delay)

    @abstractmethod
    def run(self) -> list[dict]:
        ...
