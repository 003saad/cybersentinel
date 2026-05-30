from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient = None
_db = None


async def connect_db():
    global _client, _db
    logger.info("Connecting to MongoDB...")
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client.cybersentinel
    await _client.admin.command("ping")
    # Indexes for fast queries
    await _db.threats.create_index([("detected_at", -1)])
    await _db.threats.create_index([("severity", 1)])
    await _db.threats.create_index([("type", 1)])
    await _db.scan_reports.create_index([("created_at", -1)])
    await _db.alerts.create_index([("sent_at", -1)])
    await _db.alert_config.create_index([("updated_at", -1)])
    logger.info("✅ MongoDB connected")


async def get_db():
    return _db


async def close_db():
    if _client:
        _client.close()
        logger.info("MongoDB disconnected")
