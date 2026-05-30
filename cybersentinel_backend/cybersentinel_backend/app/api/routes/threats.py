from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Query
from app.db.mongodb import get_db
from app.db.redis_client import get_feed, get_stats

router = APIRouter()


@router.get("")
async def list_threats(
    page:     int            = Query(1, ge=1),
    limit:    int            = Query(20, ge=1, le=100),
    severity: Optional[str] = None,
    type:     Optional[str] = None,
):
    db    = await get_db()
    query = {}
    if severity: query["severity"] = severity
    if type:     query["type"]     = type
    skip  = (page - 1) * limit

    items, total = [], 0
    if db:
        cursor = db.threats.find(query).sort("detected_at", -1).skip(skip).limit(limit)
        items  = await cursor.to_list(limit)
        total  = await db.threats.count_documents(query)
        for t in items:
            t["_id"] = str(t["_id"])

    return {
        "success": True, "data": items,
        "total": total, "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/feed")
async def live_feed():
    return {"success": True, "data": await get_feed(20)}


@router.get("/stats")
async def threat_stats():
    db  = await get_db()
    rt  = await get_stats()
    yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
    sev_counts = {}

    if db:
        async for doc in db.threats.aggregate([
            {"$match": {"detected_at": {"$gte": yesterday}}},
            {"$group": {"_id": "$severity", "count": {"$sum": 1}}},
        ]):
            sev_counts[doc["_id"]] = doc["count"]

    return {
        "success": True,
        "data": {
            "threats_today":   rt.get("threats_detected", 0),
            "critical":        sev_counts.get("critical", 0),
            "high":            sev_counts.get("high", 0),
            "medium":          sev_counts.get("medium", 0),
            "low":             sev_counts.get("low", 0),
            "scans_performed": rt.get("scans_performed", 0),
        },
    }


@router.put("/{threat_id}/status")
async def update_status(threat_id: str, payload: dict):
    db = await get_db()
    if db:
        await db.threats.update_one(
            {"threat_id": threat_id},
            {"$set": {"status": payload.get("status", "active")}}
        )
    return {"success": True}
