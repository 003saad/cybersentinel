import uuid
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks
from app.agents.threat_hunter import ThreatHunterAgent
from app.db.mongodb import get_db

router = APIRouter()
hunter = ThreatHunterAgent()


@router.post("/hunt")
async def trigger_hunt(bg: BackgroundTasks):
    """Manually trigger a threat hunt cycle (runs in background)."""
    bg.add_task(hunter.run_hunt_cycle)
    return {"success": True, "message": "Threat hunt started in background"}


@router.get("/status")
async def monitor_status():
    return {
        "success": True,
        "data": {
            "status":                  "active",
            "hunt_interval_minutes":   15,
            "sources_monitored": [
                "bleepingcomputer.com",
                "krebsonsecurity.com",
                "darkreading.com",
                "pastebin.com",
                "Google SERP (Bright Data)",
            ],
        },
    }


@router.post("/target")
async def add_target(payload: dict):
    db = await get_db()
    target = {
        "target_id":      str(uuid.uuid4()),
        "type":           payload.get("type", "domain"),
        "value":          payload.get("value", ""),
        "scan_frequency": payload.get("scan_frequency", "hourly"),
        "alert_threshold": payload.get("alert_threshold", 60),
        "status":         "active",
        "threat_count":   0,
        "created_at":     datetime.utcnow().isoformat(),
    }
    if db:
        await db.monitored_targets.insert_one(target)
    return {"success": True, "data": target}


@router.get("/targets")
async def list_targets():
    db = await get_db()
    targets = []
    if db:
        cur = db.monitored_targets.find({}).sort("created_at", -1).limit(50)
        targets = await cur.to_list(50)
        for t in targets:
            t["_id"] = str(t["_id"])
    return {"success": True, "data": targets}


@router.delete("/target/{target_id}")
async def delete_target(target_id: str):
    db = await get_db()
    if db:
        await db.monitored_targets.delete_one({"target_id": target_id})
    return {"success": True}
