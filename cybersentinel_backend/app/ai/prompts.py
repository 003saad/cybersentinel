SYSTEM_PROMPT = """You are CyberSentinel's AI Threat Intelligence Engine — an expert cybersecurity analyst.
You analyze live web data collected by Bright Data's infrastructure to detect cyber threats.
Always respond with concrete risk scores based on evidence, clear plain-English explanations,
and specific actionable recommendations. Respond ONLY with valid JSON, no extra text or markdown fences."""


PHISHING_ANALYSIS_PROMPT = """Analyze this potential phishing/malicious website.

TARGET URL: {url}
DOMAIN: {domain}

TECHNICAL FEATURES:
- Has SSL: {has_ssl}
- SSL Issuer: {ssl_issuer}
- Has login/password form: {has_login_form}
- Has credit card field: {has_credit_card}
- External scripts count: {external_scripts_count}
- Redirect count: {redirect_count}
- Final URL after redirects: {final_url}
- Suspicious TLD: {suspicious_tld}
- Typosquatting detected: {typosquatting_detected}
- Typosquatting target: {typosquatting_target}

PAGE CONTENT SAMPLE (first 3000 chars):
{page_content}

DOMAIN REPUTATION (via Bright Data SERP API):
Negative signals found: {negative_signals}
Top search results:
{serp_summary}

Respond with ONLY this JSON (no other text):
{{
  "risk_score": <integer 0-100>,
  "risk_level": "<CRITICAL|HIGH|MEDIUM|LOW|SAFE>",
  "is_phishing": <true|false>,
  "confidence": <float 0.0-1.0>,
  "attack_type": "<credential_harvesting|malware_delivery|scam|brand_impersonation|safe|other>",
  "brand_impersonated": "<brand name or null>",
  "mitre_techniques": ["T1566.002"],
  "risk_factors": [
    {{"factor": "<name>", "severity": "<high|medium|low>", "detail": "<explanation>"}}
  ],
  "executive_summary": "<2-3 sentence plain English summary>",
  "technical_summary": "<detailed technical analysis>",
  "recommended_actions": [
    {{"priority": "<immediate|short-term|long-term>", "action": "<specific action>", "owner": "<IT|Security|User|Legal>"}}
  ]
}}"""


THREAT_EXTRACTION_PROMPT = """You are processing live security intelligence scraped from the web by Bright Data.
Extract all concrete, real cyber threats from the content below.

SOURCE DATA:
{scraped_content}

Return ONLY a JSON array. Empty array if no real threats found.
[
  {{
    "type": "<phishing|malware|data_breach|vulnerability|ransomware|scam>",
    "severity": "<critical|high|medium|low>",
    "title": "<concise title under 80 chars>",
    "summary": "<2-3 sentence summary>",
    "affected_entities": ["<company or software name>"],
    "indicators": {{"domains": [], "ips": [], "cves": []}},
    "recommended_actions": ["<specific action>"],
    "source_url": "<url>",
    "is_active": true
  }}
]"""


CREDENTIAL_LEAK_PROMPT = """Analyze this data found online for signs of a credential leak or data breach.

RAW DATA:
{raw_data}

SOURCE URL: {source_url}
SEARCH CONTEXT: {search_context}

Return ONLY this JSON:
{{
  "is_valid_leak": <true|false>,
  "confidence": <float 0.0-1.0>,
  "organization": "<org name or unknown>",
  "breach_name": "<descriptive breach name or unknown>",
  "data_types": ["email", "password_hash", "phone"],
  "estimated_records": <number or null>,
  "severity": "<critical|high|medium|low>",
  "ai_analysis": "<plain English description of what was found>",
  "immediate_actions": ["<action>"],
  "should_notify": <true|false>
}}"""
