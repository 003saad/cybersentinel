"""
Threat Hunter Agent
────────────────────
Autonomous agent that runs every 15 minutes.
Uses Bright Data SERP + Web Unlocker + Web Scraper API to find live threats,
feeds them to AI, stores results, and pushes to the real-time feed.
"""
import uuid
import logging
from datetime import datetime

from app.bright_data.serp_client     import BrightDataSERP
from app.bright_data.web_unlocker    import WebUnlocker
from app.bright_data.web_scraper_api import WebScraperAPI
from app.ai.openai_client            import AIAnalyzer
from app.ai.prompts                  import THREAT_EXTRACTION_PROMPT
from app.db.mongodb                  import get_db
from app.db.redis_client             import push_to_feed, update_stats

logger = logging.getLogger(__name__)


class ThreatHunterAgent:

    def __init__(self):
        self.serp    = BrightDataSERP()
        self.unlock  = WebUnlocker()
        self.scraper = WebScraperAPI()
        self.ai      = AIAnalyzer()

    async def run_hunt_cycle(self) -> list:
        logger.info("🎯 Starting threat hunt cycle...")
        findings = []

        # 1 — SERP live search
        try:
            serp_hits = await self.serp.hunt_threats()
            findings.extend(serp_hits)
            logger.info(f"SERP: {len(serp_hits)} hits")
        except Exception as e:
            logger.error(f"SERP hunt error: {e}")

        # 2 — Security news
        try:
            articles = await self.scraper.scrape_security_news()
            for art in articles[:5]:
                page = await self.unlock.fetch(art["url"])
                if page["success"]:
                    findings.append({
                        "source":  art["url"],
                        "title":   art["title"],
                        "content": page["html"][:3000],
                    })
            logger.info(f"News: {len(articles)} articles scraped")
        except Exception as e:
            logger.error(f"News scrape error: {e}")

        # 3 — Pastebin monitoring
        try:
            pastes = await self.scraper.monitor_pastebin()
            for p in pastes[:3]:
                page = await self.unlock.fetch(p["url"])
                if page["success"]:
                    findings.append({
                        "source":  p["url"],
                        "title":   p["title"],
                        "content": page["html"][:2000],
                    })
            logger.info(f"Pastebin: {len(pastes)} suspicious pastes")
        except Exception as e:
            logger.error(f"Pastebin error: {e}")

        if not findings:
            logger.info("No findings this cycle")
            return []

        # AI extraction
        content = "\n\n---\n\n".join(
            f"SOURCE: {f.get('source','?')}\nTITLE: {f.get('title','')}\n"
            f"CONTENT: {f.get('content', f.get('snippet',''))[:500]}"
            for f in findings[:20]
        )
        threats = await self.ai.analyze_list(
            THREAT_EXTRACTION_PROMPT.format(scraped_content=content)
        )

        # Persist
        saved = []
        db    = await get_db()
        for t in threats:
            if not t or t.get("error"):
                continue
            t["threat_id"]   = str(uuid.uuid4())
            t["detected_at"] = datetime.utcnow().isoformat()
            t["detected_by"] = "threat_hunter"
            t["status"]      = "active"
            if db:
                await db.threats.insert_one(t)
            await push_to_feed(t)
            await update_stats("threats_detected")
            if t.get("severity") in ("critical", "high"):
                await update_stats(f"{t['severity']}_threats")
            saved.append(t)

        logger.info(f"✅ Hunt complete — {len(saved)} threats saved")
        return saved
