"""
Bright Data SERP API
─────────────────────
Searches Google programmatically. Used for:
  • Domain reputation checks
  • Live threat hunting
  • Security news discovery
"""
import logging
from datetime import datetime
import httpx
from app.config import settings

logger = logging.getLogger(__name__)
SERP_ENDPOINT = "https://api.brightdata.com/serp/google/search"


class BrightDataSERP:
    def __init__(self):
        self.api_key = settings.bright_data_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def search(self, query: str, num: int = 10) -> dict:
        if not self.api_key:
            logger.warning("SERP API key not set — returning empty results")
            return {"organic": []}
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    SERP_ENDPOINT,
                    headers=self.headers,
                    json={"q": query, "num": num, "gl": "us", "hl": "en"},
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(f"SERP search error for '{query}': {e}")
            return {"organic": []}

    async def check_domain_reputation(self, domain: str) -> dict:
        queries = [
            f'"{domain}" scam phishing fraud',
            f'"{domain}" malware virus warning site:reddit.com OR site:twitter.com',
            f'report "{domain}" security threat',
        ]
        all_results, negative = [], 0
        for q in queries:
            data = await self.search(q, num=5)
            for r in data.get("organic", []):
                text = (r.get("snippet", "") + r.get("title", "")).lower()
                if any(w in text for w in ["scam", "phishing", "fraud", "malware", "fake", "warning", "spam"]):
                    negative += 1
                all_results.append(r)
        return {"domain": domain, "negative_signals": negative, "search_results": all_results[:10]}

    async def hunt_threats(self) -> list:
        month = datetime.now().strftime("%B %Y")
        queries = [
            f"new phishing campaign {month} site:bleepingcomputer.com OR site:krebsonsecurity.com",
            f"data breach credentials leaked {month}",
            f"malware ransomware campaign {month}",
            f"critical vulnerability CVE exploit {month}",
            "credential dump pastebin leaked site:bleepingcomputer.com",
        ]
        findings = []
        for q in queries:
            data = await self.search(q, num=5)
            for r in data.get("organic", []):
                findings.append({
                    "query": q,
                    "title": r.get("title", ""),
                    "url": r.get("link", ""),
                    "snippet": r.get("snippet", ""),
                })
        return findings
