"""
Bright Data Scraping Browser
──────────────────────────────
Connects to a real Chrome browser running in Bright Data's cloud.
Executes JavaScript, captures screenshots, and extracts dynamic
content that plain HTTP requests miss.
"""
import base64
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class ScrapingBrowser:
    @property
    def ws_endpoint(self) -> str:
        return (
            f"wss://{settings.bright_data_username}:"
            f"{settings.bright_data_password}@brd.superproxy.io:9222"
        )

    async def analyze_page(self, url: str) -> dict:
        """Open URL in real Chrome, capture screenshot + security signals."""
        if not settings.bright_data_username:
            logger.warning("Scraping Browser: no credentials — skipping")
            return {
                "success": False, "url": url,
                "error": "No Bright Data credentials",
                "has_login_form": False, "has_password_field": False,
                "has_credit_card_field": False, "forms": [],
                "screenshot_base64": None, "external_scripts_count": 0,
                "network_requests_count": 0,
            }
        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(self.ws_endpoint)
                ctx = await browser.new_context(viewport={"width": 1280, "height": 800})
                page = await ctx.new_page()

                nav_requests: list = []
                page.on("request", lambda req: nav_requests.append(req.url)
                        if req.is_navigation_request() else None)

                await page.goto(url, wait_until="networkidle", timeout=30_000)

                screenshot_b64 = base64.b64encode(
                    await page.screenshot(full_page=True)
                ).decode()

                forms = await page.evaluate(
                    """() => Array.from(document.forms).map(f => ({
                        action: f.action, method: f.method,
                        has_password: Array.from(f.elements).some(e => e.type === 'password'),
                        has_email:    Array.from(f.elements).some(e => e.type === 'email'),
                        has_credit_card: Array.from(f.elements).some(e =>
                            e.name && (e.name.toLowerCase().includes('card') ||
                                       e.name.toLowerCase().includes('cvv')))
                    }))"""
                )

                ext_scripts = await page.evaluate(
                    """() => Array.from(document.scripts)
                        .map(s => s.src)
                        .filter(src => src && !src.startsWith(window.location.origin))"""
                )

                title = await page.title()
                body  = await page.evaluate(
                    "() => document.body ? document.body.innerText : ''"
                )
                final_url = page.url
                await browser.close()

                return {
                    "success": True,
                    "url": url,
                    "final_url": final_url,
                    "title": title,
                    "screenshot_base64": screenshot_b64,
                    "forms": forms,
                    "has_login_form":        any(f.get("has_password") for f in forms),
                    "has_password_field":    any(f.get("has_password") for f in forms),
                    "has_credit_card_field": any(f.get("has_credit_card") for f in forms),
                    "external_scripts":      ext_scripts[:20],
                    "external_scripts_count": len(ext_scripts),
                    "network_requests_count": len(nav_requests),
                    "body_text_sample":      body[:2000],
                }
        except Exception as e:
            logger.error(f"Scraping Browser error for {url}: {e}")
            return {
                "success": False, "url": url, "error": str(e),
                "has_login_form": False, "has_password_field": False,
                "has_credit_card_field": False, "forms": [],
                "screenshot_base64": None, "external_scripts_count": 0,
                "network_requests_count": 0,
            }
