"""
Bright Data Web Scraper API
────────────────────────────
Structured scraping of known security news sites and Pastebin
for autonomous threat intelligence gathering.
"""
import logging
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from app.bright_data.web_unlocker import WebUnlocker

logger = logging.getLogger(__name__)

SECURITY_SOURCES = [
    "https://www.bleepingcomputer.com/news/security/",
    "https://krebsonsecurity.com/",
    "https://www.darkreading.com/",
    "https://threatpost.com/",
]

THREAT_KEYWORDS = [
    "phishing", "malware", "breach", "ransomware",
    "exploit", "vulnerability", "credential", "hack", "leaked",
]


class WebScraperAPI:
    def __init__(self):
        self.unlocker = WebUnlocker()

    async def scrape_security_news(self) -> list:
        articles = []
        for src in SECURITY_SOURCES:
            try:
                result = await self.unlocker.fetch(src)
                if not result["success"]:
                    continue
                soup = BeautifulSoup(result["html"], "html.parser")
                base = f"{urlparse(src).scheme}://{urlparse(src).netloc}"
                for a in soup.find_all("a", href=True)[:60]:
                    text = a.get_text(strip=True)
                    href = a["href"]
                    if len(text) < 20:
                        continue
                    if not any(kw in text.lower() for kw in THREAT_KEYWORDS):
                        continue
                    full = href if href.startswith("http") else base + href
                    articles.append({"source": src, "title": text, "url": full})
            except Exception as e:
                logger.error(f"Scrape error for {src}: {e}")

        # Deduplicate
        seen, unique = set(), []
        for a in articles:
            if a["url"] not in seen:
                seen.add(a["url"])
                unique.append(a)
        return unique[:40]

    async def monitor_pastebin(self) -> list:
        cred_kw = ["password", "email", "login", "dump", "leaked", "breach", "combo", "database"]
        try:
            result = await self.unlocker.fetch("https://pastebin.com/archive")
            if not result["success"]:
                return []
            soup = BeautifulSoup(result["html"], "html.parser")
            suspicious = []
            for a in soup.find_all("a", href=True):
                title = a.get_text(strip=True).lower()
                href  = a["href"]
                if any(kw in title for kw in cred_kw) and href.startswith("/"):
                    suspicious.append({
                        "title": a.get_text(strip=True),
                        "url":   f"https://pastebin.com{href}",
                    })
            return suspicious[:8]
        except Exception as e:
            logger.error(f"Pastebin monitoring error: {e}")
            return []
