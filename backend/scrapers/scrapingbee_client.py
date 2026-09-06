"""ScrapingBee client — real anti-bot bypass for UK car marketplaces.

Handles the Cloudflare / DataDome / bot-detection layers that block direct
scraping. Uses premium residential proxies + JS rendering + wait timers.
"""
from __future__ import annotations
import os
import requests


BEE_ENDPOINT = "https://app.scrapingbee.com/api/v1/"


class ScrapingBeeError(Exception):
    pass


def bee_get(
    url: str,
    render_js: bool = True,
    premium: bool = True,
    wait_ms: int = 4000,
    wait_for: str | None = None,
    country: str = "gb",
    timeout: int = 120,
) -> str:
    api_key = os.environ.get("SCRAPINGBEE_API_KEY")
    if not api_key:
        raise ScrapingBeeError("SCRAPINGBEE_API_KEY not set in environment")
    params: dict = {
        "api_key": api_key,
        "url": url,
        "render_js": "true" if render_js else "false",
        "country_code": country,
    }
    if premium:
        params["premium_proxy"] = "true"
    if wait_ms and render_js:
        params["wait"] = str(wait_ms)
    if wait_for and render_js:
        params["wait_for"] = wait_for
    r = requests.get(BEE_ENDPOINT, params=params, timeout=timeout)
    if r.status_code != 200:
        raise ScrapingBeeError(
            f"ScrapingBee returned {r.status_code} for {url}: {r.text[:300]}"
        )
    return r.text


def bee_credits() -> dict:
    api_key = os.environ.get("SCRAPINGBEE_API_KEY")
    if not api_key:
        return {"error": "no api key"}
    r = requests.get(
        f"{BEE_ENDPOINT}usage", params={"api_key": api_key}, timeout=10
    )
    return r.json() if r.status_code == 200 else {"error": r.text[:200]}
