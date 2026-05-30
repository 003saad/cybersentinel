"""
Feature Extractor
──────────────────
Pulls measurable security signals from a URL and its HTML.
These become the evidence fed into the AI analysis prompt.
"""
import re
import ssl
import socket
import datetime
import logging
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import tldextract

logger = logging.getLogger(__name__)

KNOWN_BRANDS = [
    "paypal", "amazon", "google", "microsoft", "apple", "netflix",
    "facebook", "instagram", "twitter", "linkedin", "chase",
    "wellsfargo", "citibank", "barclays", "hsbc", "ebay",
    "dropbox", "yahoo", "outlook", "gmail", "bank",
]

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".tk", ".ml", ".ga", ".cf",
    ".pw", ".cc", ".gq", ".work", ".click", ".link",
}


class FeatureExtractor:

    async def extract_all(
        self, url: str, html: str,
        browser_data: dict = None,
        redirect_count: int = 0
    ) -> dict:
        url_f    = self._url_features(url)
        ssl_f    = await self._ssl_features(url)
        html_f   = self._html_features(html)
        br_f     = self._browser_features(browser_data or {})
        return {**url_f, **ssl_f, **html_f, **br_f, "redirect_count": redirect_count}

    def _url_features(self, url: str) -> dict:
        try:
            parsed = urlparse(url)
            ext    = tldextract.extract(url)
            domain = parsed.netloc.lower()
            tld    = f".{ext.suffix}" if ext.suffix else ""

            brand_found = None
            for brand in KNOWN_BRANDS:
                if brand in ext.domain.lower() and ext.domain.lower() != brand:
                    brand_found = brand
                    break

            typo = self._typosquatting(ext.domain)
            return {
                "url": url, "domain": domain, "tld": tld,
                "url_length": len(url),
                "has_suspicious_tld": tld in SUSPICIOUS_TLDS,
                "has_ip_in_url": bool(re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url)),
                "has_at_symbol": "@" in url,
                "num_dots": url.count("."),
                "num_hyphens": ext.domain.count("-"),
                "brand_impersonated": brand_found,
                "typosquatting_detected": typo is not None,
                "typosquatting_target": typo,
            }
        except Exception as e:
            logger.error(f"URL feature error: {e}")
            return {"url": url, "domain": url}

    async def _ssl_features(self, url: str) -> dict:
        has_ssl = url.startswith("https://")
        issuer, expiry_days = None, None
        if has_ssl:
            try:
                host = urlparse(url).netloc.split(":")[0]
                ctx  = ssl.create_default_context()
                with socket.create_connection((host, 443), timeout=5) as sock:
                    with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                        cert = ssock.getpeercert()
                        issuer_d = dict(x[0] for x in cert.get("issuer", []))
                        issuer   = issuer_d.get("organizationName", "Unknown")
                        exp_str  = cert.get("notAfter", "")
                        if exp_str:
                            exp = datetime.datetime.strptime(exp_str, "%b %d %H:%M:%S %Y %Z")
                            expiry_days = (exp - datetime.datetime.utcnow()).days
            except Exception:
                issuer = "Cannot verify"
        return {"has_ssl": has_ssl, "ssl_issuer": issuer, "ssl_expiry_days": expiry_days}

    def _html_features(self, html: str) -> dict:
        if not html:
            return {"html_available": False}
        try:
            soup  = BeautifulSoup(html, "html.parser")
            forms = soup.find_all("form")
            pw    = bool(soup.find("input", {"type": "password"}))
            email = bool(soup.find("input", {"type": "email"}))
            cc_kw = ["card", "cvv", "cvc", "expiry", "cardnumber"]
            has_cc = any(
                any(kw in (i.get("name","") + i.get("placeholder","")).lower() for kw in cc_kw)
                for i in soup.find_all("input")
            )
            title_tag = soup.find("title")
            return {
                "html_available": True,
                "form_count": len(forms),
                "has_password_field": pw,
                "has_email_field": email,
                "has_credit_card_field": has_cc,
                "page_title": title_tag.get_text() if title_tag else "",
                "has_meta_refresh": bool(
                    soup.find("meta", attrs={"http-equiv": re.compile("refresh", re.I)})
                ),
                "html_length": len(html),
            }
        except Exception as e:
            logger.error(f"HTML feature error: {e}")
            return {"html_available": False}

    def _browser_features(self, bd: dict) -> dict:
        if not bd.get("success"):
            return {}
        return {
            "has_login_form":         bd.get("has_login_form", False),
            "has_password_field":     bd.get("has_password_field", False),
            "has_credit_card_field":  bd.get("has_credit_card_field", False),
            "external_scripts_count": bd.get("external_scripts_count", 0),
            "network_requests_count": bd.get("network_requests_count", 0),
        }

    def _typosquatting(self, domain_name: str) -> str | None:
        d = domain_name.lower()
        for brand in KNOWN_BRANDS:
            if d == brand:
                continue
            norm = d.replace("1", "l").replace("0", "o").replace("rn", "m").replace("vv", "w")
            if brand == norm:
                return brand
            if brand in d and abs(len(d) - len(brand)) <= 3:
                return brand
        return None
