import uuid
import logging
from datetime import datetime
from fastapi import APIRouter
from app.db.mongodb import get_db
from app.config import settings
import httpx

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/config")
async def get_alert_config():
    db = await get_db()
    cfg = {}
    if db:
        doc = await db.alert_config.find_one({}, sort=[("updated_at", -1)])
        if doc:
            doc["_id"] = str(doc["_id"])
            cfg = doc
    return {
        "success": True,
        "data": cfg or {
            "email": "",
            "telegram_chat_id": "",
            "min_severity": "high",
            "min_risk_score": 70,
        },
    }


@router.post("/config")
async def save_alert_config(payload: dict):
    db = await get_db()
    if db:
        payload["updated_at"] = datetime.utcnow().isoformat()
        await db.alert_config.insert_one(payload)
    return {"success": True, "data": payload}


@router.get("/history")
async def get_alert_history():
    db = await get_db()
    items = []
    if db:
        cur = db.alerts.find({}).sort("sent_at", -1).limit(50)
        items = await cur.to_list(50)
        for i in items:
            i["_id"] = str(i["_id"])
    return {"success": True, "data": items}


@router.post("/test")
async def send_test_alert():
    """Send a test Telegram message to confirm the bot is working."""
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return {
            "success": False,
            "message": "Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env",
        }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                json={
                    "chat_id": settings.telegram_chat_id,
                    "text": "🛡️ *CyberSentinel* — Test alert successful!\nYour alerts are configured correctly.",
                    "parse_mode": "Markdown",
                },
            )
        db = await get_db()
        if db:
            await db.alerts.insert_one({
                "alert_id": str(uuid.uuid4()),
                "severity": "info",
                "message":  "Test alert sent successfully",
                "channels": ["telegram"],
                "status":   "sent",
                "sent_at":  datetime.utcnow().isoformat(),
            })
        return {"success": True, "message": "Test alert sent!"}
    except Exception as e:
        logger.error(f"Test alert error: {e}")
        return {"success": False, "message": str(e)}
