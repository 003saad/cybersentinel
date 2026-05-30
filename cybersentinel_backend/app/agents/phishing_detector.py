"""
Phishing Detector Agent
────────────────────────
Orchestrates the full URL analysis pipeline:
  1. Fetch HTML via Bright Data Web Unlocker
  2. Screenshot + JS via Bright Data Scraping Browser
  3. Domain reputation via Bright Data SERP API
  4. Feature extraction
  5. AI analysis via GPT-4
  6. Returns structured report
"""

import time
import uuid
import logging
from datetime import datetime
from urllib.parse import urlparse

from app.bright_data.serp_client import BrightDataSERP
from app.bright_data.web_unlocker import WebUnlocker
from app.bright_data.scraping_browser import ScrapingBrowser
from app.ai.openai_client import AIAnalyzer
from app.ai.prompts import PHISHING_ANALYSIS_PROMPT
from app.core.feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)


class PhishingDetectorAgent:

    def __init__(self):
        self.serp = BrightDataSERP()
        self.unlocker = WebUnlocker()
        self.browser = ScrapingBrowser()
        self.ai = AIAnalyzer()
        self.extractor = FeatureExtractor()

    async def analyze(self, url: str) -> dict:
        start = time.time()
        report_id = str(uuid.uuid4())
        logger.info(f"🔍 Analyzing: {url}")

        # 1 — Fetch page via Web Unlocker
        page = await self.unlocker.fetch(url)

        # 2 — Screenshot + JS via Scraping Browser
        browser = await self.browser.analyze_page(url)

        # 3 — Domain reputation via SERP API
        domain = urlparse(url).netloc
        rep = await self.serp.check_domain_reputation(domain)

        # 4 — Extract all features
        features = await self.extractor.extract_all(
            url=url,
            html=page.get("html", ""),
            browser_data=browser,
            redirect_count=page.get("redirect_count", 0),
        )

        # 5 — Build AI prompt
        serp_summary = (
            "\n".join(
                f"- {r.get('title','')}: {r.get('snippet','')[:100]}"
                for r in rep.get("search_results", [])[:5]
            )
            or "No negative reputation signals found in SERP results"
        )

        prompt = PHISHING_ANALYSIS_PROMPT.format(
            url=url,
            domain=domain,
            has_ssl=features.get("has_ssl", False),
            ssl_issuer=features.get("ssl_issuer", "Unknown"),
            has_login_form=features.get(
                "has_login_form", features.get("has_password_field", False)
            ),
            has_credit_card=features.get("has_credit_card_field", False),
            external_scripts_count=features.get("external_scripts_count", 0),
            redirect_count=features.get("redirect_count", 0),
            final_url=browser.get("final_url", page.get("final_url", url)),
            suspicious_tld=features.get("has_suspicious_tld", False),
            typosquatting_detected=features.get("typosquatting_detected", False),
            typosquatting_target=features.get("typosquatting_target", "None"),
            page_content=page.get("html", "")[:3000],
            negative_signals=rep.get("negative_signals", 0),
            serp_summary=serp_summary,
        )

        ai = await self.ai.analyze(prompt)
        ms = int((time.time() - start) * 1000)

        score = ai.get("risk_score", 0)
        level = self._level(score)

        return {
            "report_id": report_id,
            "url": url,
            "target_url": url,
            "status": "complete",
            "risk_score": score,
            "risk_level": level,
            "is_phishing": ai.get("is_phishing", False),
            "confidence": ai.get("confidence", 0.0),
            "attack_type": ai.get("attack_type"),
            "brand_impersonated": ai.get("brand_impersonated")
            or features.get("brand_impersonated"),
            "features": features,
            "ai_summary": ai.get("executive_summary", ""),
            "ai_technical": ai.get("technical_summary", ""),
            "recommended_actions": ai.get("recommended_actions", []),
            "risk_factors": ai.get("risk_factors", []),
            "mitre_techniques": ai.get("mitre_techniques", []),
            "screenshot_base64": browser.get("screenshot_base64"),
            "redirect_chain": page.get("redirect_chain", []),
            "bright_data_used": {
                "web_unlocker": page.get("success", False),
                "scraping_browser": browser.get("success", False),
                "serp_api": len(rep.get("search_results", [])) > 0,
            },
            "created_at": datetime.utcnow().isoformat(),
            "duration_ms": ms,
        }

    @staticmethod
    def _level(score: int) -> str:
        if score >= 80:
            return "CRITICAL"
        if score >= 60:
            return "HIGH"
        if score >= 40:
            return "MEDIUM"
        if score >= 20:
            return "LOW"
        return "SAFE"
