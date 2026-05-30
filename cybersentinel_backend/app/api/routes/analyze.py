import validators
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.agents.phishing_detector import PhishingDetectorAgent
from app.db.mongodb import get_db
from app.db.redis_client import update_stats, push_to_feed

router = APIRouter()
detector = PhishingDetectorAgent()


@router.post("/url")
async def analyze_url(payload: dict, bg: BackgroundTasks):
    url = payload.get("url", "").strip()
    if not url:
        raise HTTPException(400, "url field is required")
    if not validators.url(url):
        raise HTTPException(
            400, "Invalid URL format — must start with http:// or https://"
        )
    try:
        report = await detector.analyze(url)
        bg.add_task(_save, report)
        return {"success": True, "data": report}
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {e}")


@router.get("/report/{report_id}")
async def get_report(report_id: str):
    db = await get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")
    doc = await db.scan_reports.find_one({"report_id": report_id})
    if not doc:
        raise HTTPException(404, "Report not found")
    doc["_id"] = str(doc["_id"])
    return {"success": True, "data": doc}


@router.get("/test-gemini")
async def test_gemini():

    result = await detector.ai.analyze("""
        Return ONLY JSON:

        {
            "risk_score":5,
            "risk_level":"SAFE"
        }
        """)

    return result


async def _save(report: dict):
    db = await get_db()
    if db:
        await db.scan_reports.insert_one(report)
    await update_stats("scans_performed")
    if report.get("risk_score", 0) > 40:
        await push_to_feed(
            {
                "threat_id": report["report_id"],
                "type": "phishing",
                "severity": report["risk_level"].lower(),
                "risk_score": report["risk_score"],
                "title": f"Suspicious URL: {report['url'][:60]}",
                "summary": report.get("ai_summary", ""),
                "detected_at": report.get("created_at"),
            }
        )
