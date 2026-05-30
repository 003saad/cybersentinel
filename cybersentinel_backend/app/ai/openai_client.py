# import json
# import logging
# from openai import AsyncOpenAI
# from app.config import settings
# from app.ai.prompts import SYSTEM_PROMPT

# logger = logging.getLogger(__name__)


# class AIAnalyzer:
#     def __init__(self):
#         self.client = AsyncOpenAI(api_key=settings.openai_api_key)
#         self.model = settings.openai_model

#     async def analyze(self, prompt: str) -> dict:
#         """Call GPT-4 and return a parsed JSON dict."""
#         if not settings.openai_api_key:
#             logger.warning("No OpenAI key — returning mock analysis")
#             return self._mock_phishing()
#         try:
#             resp = await self.client.chat.completions.create(
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": SYSTEM_PROMPT},
#                     {"role": "user", "content": prompt},
#                 ],
#                 max_tokens=2000,
#                 temperature=0.1,
#             )
#             raw = resp.choices[0].message.content.strip()
#             # Strip accidental markdown fences
#             for fence in ("```json", "```"):
#                 if raw.startswith(fence):
#                     raw = raw[len(fence):]
#             if raw.endswith("```"):
#                 raw = raw[:-3]
#             return json.loads(raw.strip())
#         except json.JSONDecodeError:
#             logger.error("AI returned invalid JSON")
#             return self._mock_phishing()
#         except Exception as e:
#             logger.error(f"OpenAI error: {e}")
#             return self._mock_phishing()

#     async def analyze_list(self, prompt: str) -> list:
#         """Same as analyze() but expects a JSON array response."""
#         if not settings.openai_api_key:
#             return []
#         result = await self.analyze(prompt)
#         if isinstance(result, list):
#             return result
#         return []

#     # ── Fallback mock (used when no API key is set) ───────────────
#     def _mock_phishing(self) -> dict:
#         return {
#             "risk_score": 74,
#             "risk_level": "HIGH",
#             "is_phishing": True,
#             "confidence": 0.87,
#             "attack_type": "credential_harvesting",
#             "brand_impersonated": "PayPal",
#             "mitre_techniques": ["T1566.002", "T1598.003"],
#             "risk_factors": [
#                 {"factor": "Newly registered domain", "severity": "high",
#                  "detail": "Domain registered less than 7 days ago — classic phishing indicator"},
#                 {"factor": "Login form detected", "severity": "high",
#                  "detail": "Page contains a password-harvesting form targeting user credentials"},
#                 {"factor": "Brand impersonation", "severity": "high",
#                  "detail": "Visual design and content mimics PayPal login page"},
#                 {"factor": "Free SSL certificate", "severity": "medium",
#                  "detail": "Uses Let's Encrypt SSL — does not indicate legitimacy"},
#             ],
#             "executive_summary": (
#                 "This site appears to be a phishing page impersonating PayPal, designed to steal "
#                 "user credentials. The domain was registered recently and hosts a credential-harvesting "
#                 "login form. Immediate action is recommended to block and report this site."
#             ),
#             "technical_summary": (
#                 "Domain exhibits classic credential harvesting indicators: newly registered TLD, "
#                 "SSL certificate from free CA, form action pointing to external server, "
#                 "and visual design cloned from paypal.com. SERP reputation search returned "
#                 "negative signals from security forums."
#             ),
#             "recommended_actions": [
#                 {"priority": "immediate", "action": "Block domain in DNS/firewall rules", "owner": "IT"},
#                 {"priority": "immediate", "action": "Report to PayPal Trust & Safety at phishing@paypal.com", "owner": "Security"},
#                 {"priority": "short-term", "action": "Notify users who may have visited this URL", "owner": "Security"},
#                 {"priority": "long-term", "action": "Implement phishing-resistant MFA across all accounts", "owner": "IT"},
#             ],
#         }
import json
import logging
import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)


class AIAnalyzer:

    def __init__(self):

        genai.configure(api_key=settings.gemini_api_key)

        self.model = genai.GenerativeModel(settings.gemini_model)

    async def analyze(self, prompt: str):

        try:

            response = self.model.generate_content(prompt)

            text = response.text.strip()

            if text.startswith("```json"):
                text = text[7:]

            if text.startswith("```"):
                text = text[3:]

            if text.endswith("```"):
                text = text[:-3]

            return json.loads(text.strip())

        except Exception as e:

            logger.error(f"Gemini Error: {e}")

            return {
                "risk_score": 0,
                "risk_level": "SAFE",
                "is_phishing": False,
                "confidence": 0.0,
                "attack_type": "safe",
                "brand_impersonated": None,
                "mitre_techniques": [],
                "risk_factors": [],
                "executive_summary": f"Gemini Error: {e}",
                "technical_summary": "",
                "recommended_actions": [],
            }
