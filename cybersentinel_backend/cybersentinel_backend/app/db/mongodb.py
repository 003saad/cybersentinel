from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient = None
_db = None


async def connect_db():
    global _client, _db
    try:
        logger.info("Connecting to MongoDB...")

        _client = AsyncIOMotorClient(
            settings.mongodb_uri, serverSelectionTimeoutMS=5000
        )

        _db = _client.cybersentinel

        await _client.admin.command("ping")

        logger.info("✅ MongoDB connected")

    except Exception as e:
        logger.error(f"❌ MongoDB failed: {e}")
        _db = None


async def get_db():
    return _db


async def close_db():
    if _client:
        _client.close()
        logger.info("MongoDB disconnected")
