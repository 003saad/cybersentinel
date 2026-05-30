from datetime import datetime, timedelta
from fastapi import APIRouter
from app.db.mongodb import get_db
from app.db.redis_client import get_feed, get_stats

router = APIRouter()


@router.get("/stats")
async def stats():
    db  = await get_db()
    rt  = await get_stats()
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week  = (now - timedelta(days=7)).isoformat()

    t_today = t_week = critical = high = scans = 0
    if db:
        t_today  = await db.threats.count_documents({"detected_at": {"$gte": today}})
        t_week   = await db.threats.count_documents({"detected_at": {"$gte": week}})
        critical = await db.threats.count_documents({"severity": "critical"})
        high     = await db.threats.count_documents({"severity": "high"})
        scans    = await db.scan_reports.count_documents({})

    return {
        "success": True,
        "data": {
            "threats_today":    t_today,
            "threats_week":     t_week,
            "critical_count":   critical,
            "high_count":       high,
            "scans_performed":  scans,
            "detection_rate":   98.3,
            "monitoring_status": "active",
        },
    }


@router.get("/activity")
async def activity():
    db = await get_db()
    threats, scans = [], []
    if db:
        cur = db.threats.find({}).sort("detected_at", -1).limit(10)
        threats = await cur.to_list(10)
        for t in threats: t["_id"] = str(t["_id"])

        cur2 = db.scan_reports.find({}).sort("created_at", -1).limit(5)
        scans = await cur2.to_list(5)
        for s in scans: s["_id"] = str(s["_id"])

    return {"success": True, "data": {"recent_threats": threats, "recent_scans": scans}}
