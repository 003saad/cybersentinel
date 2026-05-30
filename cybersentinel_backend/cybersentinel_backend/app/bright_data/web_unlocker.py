"""
Bright Data Web Unlocker
─────────────────────────
Routes requests through Bright Data's residential proxy network
so any website (including bot-protected phishing sites) can be
fetched as if by a real human browser.
"""
import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class WebUnlocker:
    def __init__(self):
        if settings.bright_data_username and settings.bright_data_password:
            proxy = (
                f"http://{settings.bright_data_username}:"
                f"{settings.bright_data_password}@brd.superproxy.io:22225"
            )
            self.proxies = {"http://": proxy, "https://": proxy}
        else:
            logger.warning("Bright Data credentials not set — direct fetch (no proxy)")
            self.proxies = {}

    async def fetch(self, url: str) -> dict:
        try:
            async with httpx.AsyncClient(
                proxies=self.proxies if self.proxies else None,
                verify=False,
                timeout=30,
                follow_redirects=True,
            ) as client:
                resp = await client.get(
                    url,
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                            "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
                        )
                    },
                )
                redirect_chain = [str(r.url) for r in resp.history]
                return {
                    "success": True,
                    "url": url,
                    "final_url": str(resp.url),
                    "status_code": resp.status_code,
                    "html": resp.text,
                    "headers": dict(resp.headers),
                    "redirect_chain": redirect_chain,
                    "redirect_count": len(redirect_chain),
                }
        except Exception as e:
            logger.error(f"Web Unlocker fetch error for {url}: {e}")
            return {
                "success": False,
                "url": url,
                "error": str(e),
                "html": "",
                "redirect_chain": [],
                "redirect_count": 0,
                "final_url": url,
            }
