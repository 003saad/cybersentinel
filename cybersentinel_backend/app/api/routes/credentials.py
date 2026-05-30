import uuid
import logging
from datetime import datetime
from fastapi import APIRouter
from app.bright_data.serp_client  import BrightDataSERP
from app.bright_data.web_unlocker import WebUnlocker
from app.ai.openai_client         import AIAnalyzer
from app.ai.prompts               import CREDENTIAL_LEAK_PROMPT
from app.db.mongodb               import get_db

router   = APIRouter()
serp     = BrightDataSERP()
unlocker = WebUnlocker()
ai       = AIAnalyzer()
logger   = logging.getLogger(__name__)


@router.post("/scan")
async def scan_credentials(payload: dict):
    """
    Frontend sends: { query: "company.com", type: "domain"|"email"|"keyword" }
    """
    query      = payload.get("query", "").strip()
    scan_type  = payload.get("type", "domain")

    if not query:
        return {"success": False, "error": "query field is required"}

    # Build SERP searches based on scan type
    if scan_type == "domain":
        queries = [
            f'"{query}" password dump site:pastebin.com',
            f'"{query}" data breach credentials leaked',
            f'"{query}" email list exposed database',
        ]
    elif scan_type == "email":
        queries = [
            f'"{query}" leaked credentials pastebin',
            f'"{query}" data breach exposed',
        ]
    else:  # keyword
        queries = [
            f'"{query}" credential dump leaked',
            f'"{query}" data breach passwords',
        ]

    # Search via Bright Data SERP API
    all_results = []
    for q in queries:
        data = await serp.search(q, num=5)
        all_results.extend(data.get("organic", []))

    if not all_results:
        return {
            "success": True,
            "data": {
                "query":        query,
                "type":         scan_type,
                "leaks_found":  0,
                "is_valid_leak": False,
                "status":       "clean",
                "ai_analysis":  f"No credential leaks found for '{query}' in Bright Data SERP search.",
                "data_types":   [],
                "immediate_actions": [],
                "should_notify": False,
            },
        }

    # Fetch top 3 results via Web Unlocker for full content
    findings = []
    for r in all_results[:3]:
        page = await unlocker.fetch(r.get("link", ""))
        if page["success"]:
            findings.append({"source": r.get("link"), "content": page["html"][:2000]})

    raw_combined = "\n---\n".join(f["content"] for f in findings) if findings else \
                   "\n".join(r.get("snippet","") for r in all_results[:5])

    # AI analysis
    result = await ai.analyze(
        CREDENTIAL_LEAK_PROMPT.format(
            raw_data=raw_combined[:3000],
            source_url=findings[0]["source"] if findings else "SERP results",
            search_context=f"Query: {query}, Type: {scan_type}",
        )
    )

    # Persist if real leak
    db = await get_db()
    if result.get("is_valid_leak") and db:
        leak_doc = {
            "leak_id":        str(uuid.uuid4()),
            "affected_domain": query,
            "breach_name":    result.get("breach_name", f"{query} leak"),
            "severity":       result.get("severity", "medium"),
            "data_types":     result.get("data_types", []),
            "ai_analysis":    result.get("ai_analysis", ""),
            "detected_at":    datetime.utcnow().isoformat(),
            **result,
        }
        await db.credential_leaks.insert_one(leak_doc)

    return {
        "success": True,
        "data":    {"query": query, "type": scan_type, **result},
    }


@router.get("/breaches")
async def list_breaches():
    db = await get_db()
    items = []
    if db:
        cur = db.credential_leaks.find({}).sort("detected_at", -1).limit(20)
        items = await cur.to_list(20)
        for i in items:
            i["_id"] = str(i["_id"])
    return {"success": True, "data": items}
